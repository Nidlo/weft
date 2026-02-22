"use client";

import { Suspense, useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { VERIFY_OTP, REQUEST_OTP } from "@/lib/graphql/mutations/auth";
import type {
  VerifyOtpData,
  RequestOtpData,
} from "@/types/graphql";
import { useAuthStore } from "@/lib/stores/auth";
import { useGuestGuard } from "@/lib/hooks/use-guest-guard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-2 h-4 w-60" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-2">
              {Array(OTP_LENGTH)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-14 w-12" />
                ))}
            </div>
          </CardContent>
        </Card>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}

function VerifyOtpContent() {
  const { isGuest, isLoading: guestLoading } = useGuestGuard();
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [verifyOtp, { loading: verifying }] = useMutation(VERIFY_OTP);
  const [requestOtp, { loading: resending }] = useMutation(REQUEST_OTP);

  useEffect(() => {
    if (!phone) {
      router.replace("/auth/phone");
    }
  }, [phone, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = useCallback(
    async (code: string) => {
      try {
        const { data } = await verifyOtp({
          variables: { phone, code },
        });
        const result = data as VerifyOtpData | undefined;

        if (result?.verifyOtp) {
          const { token, user, isNew } = result.verifyOtp;
          setToken(token);
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
      }
    },
    [phone, verifyOtp, setUser, setToken, router]
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

  const maskedPhone = phone
    ? phone.replace(/(\d{3})\d{4}(\d{3})/, "$1****$2")
    : "";

  if (guestLoading || !isGuest) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-2 h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-2">
            {Array(OTP_LENGTH)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-14 w-12" />
              ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify your phone</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to {maskedPhone}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center gap-2">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="h-12 w-10 rounded-md border border-input bg-background text-center text-lg font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring sm:h-14 sm:w-12 sm:text-xl"
              autoFocus={index === 0}
              disabled={verifying}
            />
          ))}
        </div>

        {verifying && (
          <p className="text-center text-sm text-muted-foreground">
            Verifying...
          </p>
        )}

        <div className="text-center">
          {cooldown > 0 ? (
            <p className="text-sm text-muted-foreground">
              Resend code in {cooldown}s
            </p>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? "Sending..." : "Didn't receive it? Resend code"}
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => router.back()}
        >
          Use a different number
        </Button>
      </CardContent>
    </Card>
  );
}
