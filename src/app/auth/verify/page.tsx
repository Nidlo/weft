"use client";

import { Suspense, useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Clock, RotateCw } from "lucide-react";
import { toast } from "sonner";

import {
  DECLINE_RESTORE,
  REQUEST_OTP,
  RESTORE_ACCOUNT,
  VERIFY_OTP,
} from "@/lib/graphql/mutations/auth";
import type {
  GqlPendingRestore,
  RestoreAccountData,
  VerifyOtpData,
  RequestOtpData,
} from "@/types/graphql";
import { buildClaimedToast } from "@/lib/utils/claimed-toast";
import { useAuthStore } from "@/lib/stores/auth";
import { useGuestGuard } from "@/lib/hooks/use-guest-guard";
import { maskPhone } from "@/lib/utils/phone";
import { safeNext } from "@/lib/utils/safe-next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GlassCard } from "@/components/ui/glass-card";
import { StitchLoader } from "@/components/ui/stitch-loader";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <GlassCard variant="solid" className="p-8">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
          <div className="mt-8 flex justify-center gap-2">
            {Array(OTP_LENGTH)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-14 w-12 rounded-xl" />
              ))}
          </div>
        </GlassCard>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}

// Phone is handed off from /auth/phone via sessionStorage, never the URL,
// so it doesn't end up in browser history, access logs, or Referer headers.
function readPendingPhone(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("nidlo:auth:pendingPhone") ?? "";
}

function VerifyOtpContent() {
  const { isGuest, isLoading: guestLoading } = useGuestGuard();
  const router = useRouter();
  const [phone] = useState<string>(readPendingPhone);
  const setUser = useAuthStore((s) => s.setUser);
  const reduced = useReducedMotion();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  // Two layered defenses against double-submitting the same OTP:
  //   1. `submitting` — a synchronous in-flight flag. useMutation's
  //      `verifying` state flips a tick AFTER the mutation fires,
  //      long enough for a second auto-submit (fast paste + onChange
  //      duplication, focus-fire-after-blur, React 19 transition
  //      reschedule, etc.) to slip through.
  //   2. `lastSubmittedCode` + `lastSubmittedAt` — once the in-flight
  //      flag resets (after a thrown error), the user could re-submit
  //      the IDENTICAL stale code (same paste, same closure, no
  //      change in state). The code+timestamp dedupe blocks any
  //      same-code resubmit within 5s. Different codes (the wrong→
  //      right retry path) sail through untouched.
  // Together these guarantee: at most one verifyOtp call per unique
  // code within the rapid-fire window. Crucial because every double
  // call inflates the failed-attempts counter and risks tripping
  // lockout, after which the otpKey is dropped and the next real
  // attempt returns "Verification code expired".
  const submitting = useRef(false);
  const lastSubmittedCode = useRef<string | null>(null);
  const lastSubmittedAt = useRef(0);
  const DEDUPE_WINDOW_MS = 5000;

  const [verifyOtp, { loading: verifying }] = useMutation(VERIFY_OTP);
  const [requestOtp, { loading: resending }] = useMutation(REQUEST_OTP);
  const [restoreAccount, { loading: restoring }] = useMutation(RESTORE_ACCOUNT);
  const [declineRestore, { loading: declining }] = useMutation(DECLINE_RESTORE);

  // Set after verifyOtp returns pendingRestore. The modal renders off this
  // state and gates the restore / decline mutations on it.
  const [pendingRestore, setPendingRestore] =
    useState<GqlPendingRestore | null>(null);

  useEffect(() => {
    // Wait one tick for the phone-from-sessionStorage effect to run before
    // bouncing — otherwise direct page loads always redirect even when the
    // value is present.
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("nidlo:auth:pendingPhone");
    if (!stored) {
      router.replace("/auth/phone");
    }
  }, [router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = useCallback(
    async (code: string) => {
      if (submitting.current) return;
      if (
        lastSubmittedCode.current === code &&
        Date.now() - lastSubmittedAt.current < DEDUPE_WINDOW_MS
      ) {
        return;
      }
      submitting.current = true;
      lastSubmittedCode.current = code;
      lastSubmittedAt.current = Date.now();
      let navigated = false;
      try {
        const { data } = await verifyOtp({
          variables: { phone, code },
        });
        const result = data as VerifyOtpData | undefined;

        if (result?.verifyOtp) {
          // Phone belongs to a soft-deleted account inside its recovery
          // window. The backend has NOT signed us in; surface the restore
          // prompt instead. submitting stays true so the auto-dispatch
          // doesn't refire while the modal is open — declineRestore will
          // reset it.
          if (result.verifyOtp.pendingRestore) {
            setPendingRestore(result.verifyOtp.pendingRestore);
            return;
          }

          const { user, isNew } = result.verifyOtp;
          setUser({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            phone: user.phone || "",
            email: user.email,
            avatarUrl: user.avatarUrl,
            city: user.city,
            isDesigner: user.isDesigner,
            isOnboarded: user.isOnboarded,
          });

          toast.success("Phone verified!");
          // If a designer parked orders/measurements against this phone
          // before signup, AuthService::linkOrphansByPhone() claimed them
          // in the same DB transaction as user creation. Surface the
          // counts so the user knows where the records came from.
          const claimedCopy = buildClaimedToast(
            result.verifyOtp.claimedOrdersCount,
            result.verifyOtp.claimedMeasurementsCount
          );
          if (claimedCopy) {
            toast.success(claimedCopy);
          }
          sessionStorage.removeItem("nidlo:auth:pendingPhone");
          // Honour the deep-link target captured on /auth/phone via
          // ?next=, so an SMS / email / push click lands on the
          // intended page after login. Already-onboarded users go
          // straight to the deep-link; non-onboarded users finish
          // onboarding first (the captured next survives in
          // sessionStorage and is picked up later if the role flow
          // forwards it — handled by the role page or simply cleared).
          const rawNext = sessionStorage.getItem("nidlo:auth:next");
          if (rawNext) {
            sessionStorage.removeItem("nidlo:auth:next");
          }
          navigated = true;

          if (isNew || !user.isOnboarded) {
            router.push("/auth/role");
          } else {
            router.push(safeNext(rawNext));
          }
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Verification failed";
        toast.error(message);
        setDigits(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        // Deliberately do NOT reset `lastSubmittedCode` here. The catch
        // block runs from an error response, but the auto-submit-on-6-
        // digits handler can still re-fire moments later with the same
        // stale code from a captured closure. Keeping the dedupe armed
        // for 5s blocks that. The user's real retry path is to type a
        // *different* code (the correct one), which sails through.
      } finally {
        // Reset unless we successfully navigated — keeping it true past
        // navigation is harmless (component unmounts) and prevents a
        // double-fire if router.push hasn't unmounted us yet.
        if (!navigated) {
          submitting.current = false;
        }
      }
    },
    [phone, verifyOtp, setUser, router]
  );

  const handleConfirmRestore = useCallback(async () => {
    try {
      const { data } = await restoreAccount();
      const result = data as RestoreAccountData | undefined;
      if (!result?.restoreAccount) {
        toast.error("Could not restore your account. Try again.");
        return;
      }
      const { user } = result.restoreAccount;
      setUser({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        phone: user.phone || "",
        email: user.email,
        avatarUrl: user.avatarUrl,
        city: user.city,
        isDesigner: user.isDesigner,
        isOnboarded: user.isOnboarded,
      });
      toast.success("Welcome back. Your account has been restored.");
      const claimedCopy = buildClaimedToast(
        result.restoreAccount.claimedOrdersCount,
        result.restoreAccount.claimedMeasurementsCount
      );
      if (claimedCopy) toast.success(claimedCopy);

      sessionStorage.removeItem("nidlo:auth:pendingPhone");
      const rawNext = sessionStorage.getItem("nidlo:auth:next");
      if (rawNext) sessionStorage.removeItem("nidlo:auth:next");

      setPendingRestore(null);
      if (!user.isOnboarded) {
        router.push("/auth/role");
      } else {
        router.push(safeNext(rawNext));
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not restore account";
      toast.error(message);
    }
  }, [restoreAccount, setUser, router]);

  const handleDeclineRestore = useCallback(async () => {
    try {
      await declineRestore();
    } catch {
      // Server-side marker clear is best-effort; we still let the user
      // dismiss locally.
    }
    setPendingRestore(null);
    setDigits(Array(OTP_LENGTH).fill(""));
    submitting.current = false;
    lastSubmittedCode.current = null;
    inputRefs.current[0]?.focus();
    toast.message(
      "Got it. Your account stays in its 30-day recovery window. Sign in again any time before then to restore it."
    );
    router.replace("/auth/phone");
  }, [declineRestore, router]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];

    if (value.length > 1) {
      const pasted = value.slice(0, OTP_LENGTH - index).split("");
      pasted.forEach((d, i) => {
        newDigits[index + i] = d;
      });
      setDigits(newDigits);

      const nextIndex = Math.min(index + pasted.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();

      const code = newDigits.join("");
      if (code.length === OTP_LENGTH) {
        handleVerify(code);
      }
      return;
    }

    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const code = newDigits.join("");
    if (code.length === OTP_LENGTH && !newDigits.includes("")) {
      handleVerify(code);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    try {
      const { data } = await requestOtp({ variables: { phone } });
      const result = data as RequestOtpData | undefined;

      if (result?.requestOtp.success) {
        toast.success("New code sent!");
        setCooldown(RESEND_COOLDOWN);
        setDigits(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      } else {
        toast.error(result?.requestOtp.message || "Failed to resend");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to resend";
      toast.error(message);
    }
  };

  const maskedPhone = maskPhone(phone);

  if (guestLoading || !isGuest) {
    return (
      <GlassCard variant="solid" className="p-8">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
        <div className="mt-8 flex justify-center gap-2">
          {Array(OTP_LENGTH)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-14 w-12 rounded-xl" />
            ))}
        </div>
      </GlassCard>
    );
  }

  const cooldownPct = Math.max(
    0,
    Math.min(100, ((RESEND_COOLDOWN - cooldown) / RESEND_COOLDOWN) * 100)
  );

  return (
    <GlassCard variant="solid" className="p-8">
      <header className="mb-7">
        <h1 className="text-display text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
          Check your phone.
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          We sent a 6-digit code to{" "}
          <span className="text-foreground font-medium tabular-nums">
            {maskedPhone}
          </span>
        </p>
      </header>

      <div
        className="flex justify-center gap-2 sm:gap-3"
        aria-label="One-time code"
      >
        {digits.map((digit, index) => (
          <motion.div
            key={index}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: reduced ? 0 : index * 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <input
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={cn(
                "bg-background/60 h-14 w-11 rounded-xl border-2 text-center text-xl font-semibold tabular-nums transition-all duration-200",
                "focus:border-copper outline-none focus:scale-105 focus:shadow-(--shadow-glow)",
                digit
                  ? "border-foreground/40 text-foreground"
                  : "border-border text-muted-foreground",
                "sm:h-16 sm:w-12 sm:text-2xl"
              )}
              autoFocus={index === 0}
              disabled={verifying}
              aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
            />
          </motion.div>
        ))}
      </div>

      {verifying && (
        <div className="mt-6 flex justify-center">
          <StitchLoader label="Verifying..." size={20} />
        </div>
      )}

      {/* Cooldown — visible thread-like progress bar that drains as time passes.
          When it reaches zero the resend button takes its place. */}
      <div className="mt-7 text-center">
        {cooldown > 0 ? (
          <div className="space-y-2.5">
            <p className="text-muted-foreground text-xs">
              Resend code in{" "}
              <span className="text-foreground font-semibold tabular-nums">
                {cooldown}s
              </span>
            </p>
            <div
              className="bg-border mx-auto h-0.5 w-32 overflow-hidden rounded-full"
              aria-hidden
            >
              <div
                className="bg-copper h-full transition-[width] duration-1000 ease-linear"
                style={{ width: `${cooldownPct}%` }}
              />
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResend}
            loading={resending}
            loadingLabel="Sending..."
            className="gap-1.5"
          >
            <RotateCw className="h-3.5 w-3.5" aria-hidden />
            Resend code
          </Button>
        )}
      </div>

      <Button
        variant="ghost"
        className="text-muted-foreground mt-3 w-full gap-1.5"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Use a different number
      </Button>

      <Dialog
        open={pendingRestore !== null}
        onOpenChange={(open) => {
          if (!open && !restoring) handleDeclineRestore();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <div className="bg-copper/15 text-copper ring-copper/30 mb-3 inline-flex size-10 items-center justify-center rounded-xl ring-1">
              <Clock className="h-5 w-5" aria-hidden />
            </div>
            <DialogTitle className="text-display text-2xl font-semibold tracking-tight">
              Restore your Nidlo account?
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              You deactivated this account, but we have been keeping it for you.
              There{" "}
              {pendingRestore?.daysRemaining === 1
                ? "is 1 day"
                : `are ${pendingRestore?.daysRemaining ?? 0} days`}{" "}
              left to restore everything &mdash; your profile, order history,
              saved measurements and messages all come back as they were.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="ghost"
              size="lg"
              onClick={handleDeclineRestore}
              disabled={restoring}
              loading={declining}
              loadingLabel="One moment..."
            >
              Not now
            </Button>
            <Button
              variant="luxe-outline"
              size="lg"
              onClick={handleConfirmRestore}
              loading={restoring}
              loadingLabel="Restoring..."
              disabled={declining}
            >
              Restore my account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </GlassCard>
  );
}
