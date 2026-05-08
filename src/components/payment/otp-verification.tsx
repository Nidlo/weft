"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2, Clock } from "lucide-react";

interface OtpVerificationProps {
  phone?: string;
  onSubmit: (otp: string) => void;
  onResend?: () => void;
  loading: boolean;
  resending?: boolean;
  attemptsRemaining?: number;
  /** OTP validity window in seconds. Defaults to 5 minutes. */
  expiresInSeconds?: number;
  error?: string | null;
}

function formatTime(seconds: number): string {
  const mm = Math.floor(seconds / 60).toString().padStart(2, "0");
  const ss = (seconds % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

export function OtpVerification({
  phone,
  onSubmit,
  onResend,
  loading,
  resending,
  attemptsRemaining,
  expiresInSeconds = 300,
  error,
}: OtpVerificationProps) {
  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(expiresInSeconds);
  // Track the start time so the timer survives re-renders without resetting.
  // Init lazily inside an effect — `Date.now()` during render is impure and
  // trips React 19's purity rule.
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    startedAtRef.current = Date.now();
    const id = setInterval(() => {
      if (startedAtRef.current === null) return;
      const elapsed = Math.floor(
        (Date.now() - startedAtRef.current) / 1000
      );
      const remaining = Math.max(0, expiresInSeconds - elapsed);
      setSecondsLeft(remaining);
      if (remaining === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [expiresInSeconds]);

  const expired = secondsLeft === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length >= 4 && !expired) {
      onSubmit(otp);
    }
  };

  const handleResend = () => {
    if (!onResend || resending) return;
    setOtp("");
    startedAtRef.current = Date.now();
    setSecondsLeft(expiresInSeconds);
    onResend();
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-status-info-soft">
          <ShieldCheck className="h-8 w-8 text-status-info" />
        </div>
        <CardTitle className="text-lg">Verify Your Number</CardTitle>
        <p className="text-sm text-muted-foreground">
          An OTP code has been sent to{" "}
          {phone ? <strong>{phone}</strong> : "your phone"}.
          Enter it below to proceed with payment.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="otp">OTP Code</Label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              autoFocus
              disabled={expired}
              className="text-center text-lg tracking-widest"
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span
              className={
                expired
                  ? "flex items-center gap-1 text-destructive"
                  : "flex items-center gap-1 text-muted-foreground"
              }
            >
              <Clock className="h-3 w-3" />
              {expired
                ? "Session expired"
                : `Expires in ${formatTime(secondsLeft)}`}
            </span>
            {typeof attemptsRemaining === "number" && attemptsRemaining > 0 && (
              <span className="text-muted-foreground">
                {attemptsRemaining}{" "}
                {attemptsRemaining === 1 ? "attempt" : "attempts"} left
              </span>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          {expired ? (
            onResend ? (
              <Button
                type="button"
                className="w-full"
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending new code...
                  </>
                ) : (
                  "Send a new code"
                )}
              </Button>
            ) : (
              <Button type="button" variant="outline" className="w-full" disabled>
                Code expired — restart the payment
              </Button>
            )
          ) : (
            <Button
              type="submit"
              className="w-full"
              disabled={otp.length < 4 || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Pay"
              )}
            </Button>
          )}

          {!expired && onResend && (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || secondsLeft > expiresInSeconds - 30}
              className="block w-full text-center text-xs text-muted-foreground underline disabled:no-underline disabled:opacity-50"
            >
              {resending
                ? "Sending..."
                : secondsLeft > expiresInSeconds - 30
                  ? `Resend available in ${30 - (expiresInSeconds - secondsLeft)}s`
                  : "Didn't get the code? Resend"}
            </button>
          )}

          <p className="text-center text-xs text-muted-foreground">
            This is a one-time verification for first-time payments.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
