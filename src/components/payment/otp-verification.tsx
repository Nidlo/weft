"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2 } from "lucide-react";

interface OtpVerificationProps {
  phone?: string;
  onSubmit: (otp: string) => void;
  loading: boolean;
  error?: string | null;
}

export function OtpVerification({ phone, onSubmit, loading, error }: OtpVerificationProps) {
  const [otp, setOtp] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length >= 4) {
      onSubmit(otp);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <ShieldCheck className="h-8 w-8 text-blue-600" />
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
              className="text-center text-lg tracking-widest"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

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

          <p className="text-center text-xs text-muted-foreground">
            This is a one-time verification for first-time payments.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
