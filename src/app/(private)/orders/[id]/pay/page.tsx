"use client";

import { Suspense, use, useState } from "react";
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
import { OtpVerification } from "@/components/payment/otp-verification";
import { MomoPendingScreen } from "@/components/payment/momo-pending-screen";
import { formatPesewas } from "@/lib/utils/order";
import type { PaymentMethodValue } from "@/types/graphql";

type PayStep = "method" | "otp" | "momo-pending";

export default function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="mx-auto max-w-md space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-48 w-full" />
          </div>
        </AppShell>
      }
    >
      <PaymentPageContent params={params} />
    </Suspense>
  );
}

function PaymentPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentType = (searchParams.get("type") ?? "deposit") as
    | "deposit"
    | "balance";

  const { user, isReady } = useAuthGuard({ requireOnboarded: true });
  const { order, loading: orderLoading } = useOrder(orderId);
  const { initiatePayment, loading: initiating } = useInitiatePayment();

  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<PayStep>("method");
  const [pendingMethod, setPendingMethod] = useState<PaymentMethodValue | null>(
    null
  );
  const [pendingPhone, setPendingPhone] = useState<string | undefined>(
    undefined
  );
  const [otpSessionId, setOtpSessionId] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);

  const confirmedPrice = order?.confirmedPrice ?? 0;
  const summary = order?.paymentSummary;
  // Always trust server-computed amounts — never reconstruct money client-side.
  const amount = summary
    ? paymentType === "deposit"
      ? summary.depositOwed
      : summary.balanceOwed
    : null;

  const callbackPath = `/orders/${orderId}/pay/callback`;

  const handleInitiationResult = (
    result: {
      authorizationUrl: string | null;
      requiresOtp: boolean;
      sessionId: string | null;
      isMomo: boolean;
      payment: { reference: string };
    } | null
  ) => {
    if (!result) return;

    if (result.authorizationUrl) {
      window.location.href = result.authorizationUrl;
      return;
    }

    if (result.requiresOtp && result.sessionId) {
      setOtpSessionId(result.sessionId);
      setStep("otp");
      return;
    }

    if (result.isMomo) {
      setPaymentReference(result.payment.reference);
      setStep("momo-pending");
      return;
    }

    setError("Payment couldn't be started. Please try a different method.");
  };

  const handleMethodSelect = async (
    method: PaymentMethodValue,
    phoneNumber?: string
  ) => {
    setError(null);
    setPendingMethod(method);
    setPendingPhone(phoneNumber);

    const callbackUrl = `${window.location.origin}${callbackPath}`;

    try {
      const result = await initiatePayment({
        orderId,
        type: paymentType,
        method,
        callbackUrl,
        phone: phoneNumber,
      });

      handleInitiationResult(result);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Payment initiation failed. Please try again.";
      setError(message);
    }
  };

  const handleOtpSubmit = async (otp: string) => {
    if (!pendingMethod || !otpSessionId) return;
    setError(null);

    const callbackUrl = `${window.location.origin}${callbackPath}`;

    try {
      const result = await initiatePayment({
        orderId,
        type: paymentType,
        method: pendingMethod,
        callbackUrl,
        phone: pendingPhone,
        otp,
        sessionId: otpSessionId,
      });

      handleInitiationResult(result);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "OTP verification failed. Please try again.";
      setError(message);
    }
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
          <p className="text-muted-foreground">
            Order not found or price not confirmed.
          </p>
          <Button variant="link" asChild className="mt-2">
            <Link href="/orders">Back to Orders</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  // Don't render the form until the server has resolved the payment summary.
  if (amount === null) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full" />
        </div>
      </AppShell>
    );
  }

  if (amount <= 0) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md space-y-6">
          <Link
            href={`/orders/${orderId}`}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Order
          </Link>
          <div className="py-8 text-center">
            <p className="text-lg font-semibold">
              {paymentType === "deposit" ? "Deposit" : "Balance"} Already Paid
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              This payment phase has been fully covered.
            </p>
            <Button variant="link" asChild className="mt-4">
              <Link href={`/orders/${orderId}`}>Back to Order</Link>
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-md space-y-6">
        <Link
          href={`/orders/${orderId}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Order
        </Link>

        <div>
          <h1 className="text-xl font-bold">
            Pay {paymentType === "deposit" ? "Deposit" : "Balance"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Amount: <strong>{formatPesewas(amount)}</strong>
            {paymentType === "deposit" && (
              <> (50% of {formatPesewas(confirmedPrice)})</>
            )}
          </p>
        </div>

        {error && (
          <div className="border-destructive/20 bg-destructive/5 text-destructive rounded-lg border p-3 text-sm">
            {error}
          </div>
        )}

        {step === "method" && (
          <PaymentMethodSelector
            onSelect={handleMethodSelect}
            loading={initiating}
            defaultPhone={user.phone ?? undefined}
          />
        )}

        {step === "otp" && (
          <OtpVerification
            phone={pendingPhone}
            onSubmit={handleOtpSubmit}
            onResend={
              pendingMethod
                ? () => handleMethodSelect(pendingMethod, pendingPhone)
                : undefined
            }
            loading={initiating}
            resending={initiating}
            error={error}
          />
        )}

        {step === "momo-pending" && paymentReference && pendingMethod && (
          <MomoPendingScreen
            reference={paymentReference}
            method={pendingMethod}
            amount={amount}
            phone={pendingPhone}
            onSuccess={() =>
              router.replace(`${callbackPath}?reference=${paymentReference}`)
            }
            onFailed={() => {
              setError("Payment failed or was declined. Please try again.");
              setStep("method");
              setPaymentReference(null);
            }}
            onTimeout={() => {
              setError(
                "Payment timed out. Please try again or use a different method."
              );
              setStep("method");
              setPaymentReference(null);
            }}
          />
        )}
      </div>
    </AppShell>
  );
}
