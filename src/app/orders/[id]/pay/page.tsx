"use client";

import { use, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useOrder } from "@/lib/hooks/use-orders";
import { useInitiatePayment } from "@/lib/hooks/use-payments";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PaymentMethodSelector } from "@/components/payment/payment-method-selector";
import { MomoPendingScreen } from "@/components/payment/momo-pending-screen";
import { PaymentResult } from "@/components/payment/payment-result";
import { OtpVerification } from "@/components/payment/otp-verification";
import { formatPesewas } from "@/lib/utils/order";
import { calculateDeposit, calculateBalance } from "@/lib/utils/payment";
import type { PaymentMethodValue } from "@/types/graphql";

type PayStep = "method" | "otp" | "momo-pending" | "result";

export default function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orderId } = use(params);
  const searchParams = useSearchParams();
  const paymentType = (searchParams.get("type") ?? "deposit") as "deposit" | "balance";
  const router = useRouter();

  const { user, isReady } = useAuthGuard({ requireOnboarded: true });
  const { order, loading: orderLoading } = useOrder(orderId);
  const { initiatePayment, loading: initiating } = useInitiatePayment();

  const [step, setStep] = useState<PayStep>("method");
  const [reference, setReference] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodValue | null>(null);
  const [phone, setPhone] = useState<string | undefined>();
  const [resultStatus, setResultStatus] = useState<"success" | "failed" | "timeout">("success");
  const [otpSessionId, setOtpSessionId] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  const confirmedPrice = order?.confirmedPrice ?? 0;
  const amount = paymentType === "deposit"
    ? calculateDeposit(confirmedPrice)
    : calculateBalance(confirmedPrice);

  const handleMethodSelect = async (method: PaymentMethodValue, phoneNumber?: string) => {
    setSelectedMethod(method);
    setPhone(phoneNumber);

    const callbackUrl = `${window.location.origin}/orders/${orderId}/pay/callback`;

    try {
      const result = await initiatePayment({
        orderId,
        type: paymentType,
        method,
        callbackUrl,
        phone: phoneNumber,
      });

      if (!result) return;

      setReference(result.payment.reference);

      // OTP required (Moolre first-time payer)
      if (result.requiresOtp && result.sessionId) {
        setOtpSessionId(result.sessionId);
        setStep("otp");
        return;
      }

      if (result.isMomo) {
        // MoMo: show pending screen with polling
        setStep("momo-pending");
      } else if (result.authorizationUrl) {
        // Card/Payment link: redirect to hosted page
        window.location.href = result.authorizationUrl;
      }
    } catch {
      // Error is surfaced by the hook via error state
    }
  };

  const handleOtpSubmit = async (otp: string) => {
    if (!selectedMethod || !otpSessionId) return;
    setOtpError(null);

    const callbackUrl = `${window.location.origin}/orders/${orderId}/pay/callback`;

    try {
      const result = await initiatePayment({
        orderId,
        type: paymentType,
        method: selectedMethod,
        callbackUrl,
        phone,
        otp,
        sessionId: otpSessionId,
      });

      if (!result) return;

      setReference(result.payment.reference);
      setOtpSessionId(null);

      if (result.isMomo) {
        setStep("momo-pending");
      } else if (result.authorizationUrl) {
        window.location.href = result.authorizationUrl;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "OTP verification failed. Please try again.";
      setOtpError(message);
    }
  };

  const handleMomoSuccess = useCallback(() => {
    setResultStatus("success");
    setStep("result");
  }, []);

  const handleMomoFailed = useCallback(() => {
    setResultStatus("failed");
    setStep("result");
  }, []);

  const handleMomoTimeout = useCallback(() => {
    setResultStatus("timeout");
    setStep("result");
  }, []);

  const handleRetry = () => {
    setStep("method");
    setReference(null);
    setSelectedMethod(null);
    setPhone(undefined);
    setOtpSessionId(null);
    setOtpError(null);
  };

  if (!isReady || !user || orderLoading) {
    return (
      <AppShell>
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full" />
        </div>
      </AppShell>
    );
  }

  if (!order || !order.confirmedPrice) {
    return (
      <AppShell>
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Order not found or price not confirmed.</p>
          <Button variant="link" asChild className="mt-2">
            <Link href="/orders">Back to Orders</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-md space-y-6">
        {/* Back link */}
        {(step === "method" || step === "otp") && (
          <Link
            href={step === "otp" ? "#" : `/orders/${orderId}`}
            onClick={step === "otp" ? (e) => { e.preventDefault(); handleRetry(); } : undefined}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === "otp" ? "Change Payment Method" : "Back to Order"}
          </Link>
        )}

        {/* Header */}
        {(step === "method" || step === "otp") && (
          <div>
            <h1 className="text-xl font-bold">
              Pay {paymentType === "deposit" ? "Deposit" : "Balance"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Amount: <strong>{formatPesewas(amount)}</strong>
              {paymentType === "deposit" && (
                <> (50% of {formatPesewas(confirmedPrice)})</>
              )}
            </p>
          </div>
        )}

        {/* Step content */}
        {step === "method" && (
          <PaymentMethodSelector
            onSelect={handleMethodSelect}
            loading={initiating}
            defaultPhone={user.phone ?? undefined}
          />
        )}

        {step === "otp" && (
          <OtpVerification
            phone={phone}
            onSubmit={handleOtpSubmit}
            loading={initiating}
            error={otpError}
          />
        )}

        {step === "momo-pending" && reference && selectedMethod && (
          <MomoPendingScreen
            reference={reference}
            method={selectedMethod}
            amount={amount}
            phone={phone}
            onSuccess={handleMomoSuccess}
            onFailed={handleMomoFailed}
            onTimeout={handleMomoTimeout}
          />
        )}

        {step === "result" && (
          <PaymentResult
            status={resultStatus}
            amount={amount}
            paymentType={paymentType}
            orderId={orderId}
            onRetry={resultStatus !== "success" ? handleRetry : undefined}
            onBackToOrder={() => router.push(`/orders/${orderId}`)}
          />
        )}
      </div>
    </AppShell>
  );
}
