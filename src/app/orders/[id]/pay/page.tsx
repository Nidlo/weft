"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useOrder } from "@/lib/hooks/use-orders";
import { useInitiatePayment } from "@/lib/hooks/use-payments";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PaymentMethodSelector } from "@/components/payment/payment-method-selector";
import { formatPesewas } from "@/lib/utils/order";
import type { PaymentMethodValue } from "@/types/graphql";

export default function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orderId } = use(params);
  const searchParams = useSearchParams();
  const paymentType = (searchParams.get("type") ?? "deposit") as "deposit" | "balance";

  const { user, isReady } = useAuthGuard({ requireOnboarded: true });
  const { order, loading: orderLoading } = useOrder(orderId);
  const { initiatePayment, loading: initiating } = useInitiatePayment();

  const [error, setError] = useState<string | null>(null);

  const confirmedPrice = order?.confirmedPrice ?? 0;
  const summary = order?.paymentSummary;
  const amount = paymentType === "deposit"
    ? (summary?.depositOwed ?? Math.ceil(confirmedPrice / 2))
    : (summary?.balanceOwed ?? confirmedPrice - Math.ceil(confirmedPrice / 2));

  const handleMethodSelect = async (method: PaymentMethodValue, phoneNumber?: string) => {
    setError(null);

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

      // Hosted payment page (Moolre or Paystack) — redirect
      if (result.authorizationUrl) {
        window.location.href = result.authorizationUrl;
      } else {
        setError("No payment URL returned. Please try again.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment initiation failed. Please try again.";
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
          <p className="text-muted-foreground">Order not found or price not confirmed.</p>
          <Button variant="link" asChild className="mt-2">
            <Link href="/orders">Back to Orders</Link>
          </Button>
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
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Order
          </Link>
          <div className="py-8 text-center">
            <p className="text-lg font-semibold">
              {paymentType === "deposit" ? "Deposit" : "Balance"} Already Paid
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
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
        {/* Back link */}
        <Link
          href={`/orders/${orderId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Order
        </Link>

        {/* Header */}
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

        {/* Error message */}
        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Payment method selection */}
        <PaymentMethodSelector
          onSelect={handleMethodSelect}
          loading={initiating}
          defaultPhone={user.phone ?? undefined}
        />
      </div>
    </AppShell>
  );
}
