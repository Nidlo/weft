"use client";

import { Suspense, useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, RotateCw } from "lucide-react";
import { toast } from "sonner";

import { VERIFY_OTP, REQUEST_OTP } from "@/lib/graphql/mutations/auth";
import type {
  VerifyOtpData,
  RequestOtpData,
} from "@/types/graphql";
import { useAuthStore } from "@/lib/stores/auth";
import { useGuestGuard } from "@/lib/hooks/use-guest-guard";
import { maskPhone } from "@/lib/utils/phone";
import { Button } from "@/components/ui/button";
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
  // Synchronous in-flight guard. `useMutation`'s `verifying` flag flips
  // a tick AFTER the mutation is fired — long enough for a second
  // auto-submit (e.g. fast paste + onChange duplication) to slip
  // through and double-submit the same code. Once the first call wins
  // and clears the OTP key, the second response says "expired" and
  // the user thinks the correct code was rejected.
  const submitting = useRef(false);

  const [verifyOtp, { loading: verifying }] = useMutation(VERIFY_OTP);
  const [requestOtp, { loading: resending }] = useMutation(REQUEST_OTP);

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
      submitting.current = true;
      try {
        const { data } = await verifyOtp({
          variables: { phone, code },
        });
        const result = data as VerifyOtpData | undefined;

        if (result?.verifyOtp) {
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
          sessionStorage.removeItem("nidlo:auth:pendingPhone");

          if (isNew || !user.isOnboarded) {
            router.push("/auth/role");
          } else {
            router.push("/dashboard");
          }
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Verification failed";
        toast.error(message);
        setDigits(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        submitting.current = false;
      }
    },
    [phone, verifyOtp, setUser, router]
  );

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
        <h1 className="text-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
          Check your phone.
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground tabular-nums">
            {maskedPhone}
          </span>
        </p>
      </header>

      <div className="flex justify-center gap-2 sm:gap-3" aria-label="One-time code">
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
                "h-14 w-11 rounded-xl border-2 bg-background/60 text-center text-xl font-semibold tabular-nums transition-all duration-200",
                "outline-none focus:scale-105 focus:border-copper focus:shadow-(--shadow-glow)",
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
            <p className="text-xs text-muted-foreground">
              Resend code in{" "}
              <span className="font-semibold tabular-nums text-foreground">
                {cooldown}s
              </span>
            </p>
            <div
              className="mx-auto h-0.5 w-32 overflow-hidden rounded-full bg-border"
              aria-hidden
            >
              <div
                className="h-full bg-copper transition-[width] duration-1000 ease-linear"
                style={{ width: `${cooldownPct}%` }}
              />
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResend}
            disabled={resending}
            className="gap-1.5"
          >
            <RotateCw
              className={cn(
                "h-3.5 w-3.5",
                resending && "animate-spin"
              )}
              aria-hidden
            />
            {resending ? "Sending..." : "Resend code"}
          </Button>
        )}
      </div>

      <Button
        variant="ghost"
        className="mt-3 w-full gap-1.5 text-muted-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Use a different number
      </Button>
    </GlassCard>
  );
}
