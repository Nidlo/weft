"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { usePaymentStatus } from "@/lib/hooks/use-payments";
import { AppShell } from "@/components/layout/app-shell";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPesewas } from "@/lib/utils/order";

export default function PaymentCallbackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orderId } = use(params);
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") ?? searchParams.get("trxref");
  const router = useRouter();

  const { isReady } = useAuthGuard({ requireOnboarded: true });
  const { payment, loading } = usePaymentStatus(reference);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (payment && !verified) {
      setVerified(true);
    }
  }, [payment, verified]);

  if (!isReady || loading || !verified) {
    return (
      <AppShell>
        <div className="flex flex-col items-center space-y-4 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying your payment...</p>
        </div>
      </AppShell>
    );
  }

  const isSuccess = payment?.status === "success";

  return (
    <AppShell>
      <div className="mx-auto max-w-md">
        <div className="flex flex-col items-center space-y-6 py-8 text-center">
          {isSuccess ? (
            <>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold">Payment Successful</h2>
                {payment && (
                  <p className="text-sm text-muted-foreground">
                    <strong>{formatPesewas(payment.amount)}</strong> has been received.
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold">Payment Failed</h2>
                <p className="text-sm text-muted-foreground">
                  Your payment could not be processed. Please try again.
                </p>
              </div>
            </>
          )}

          <div className="flex gap-3">
            {!isSuccess && (
              <Button onClick={() => router.push(`/orders/${orderId}/pay?type=deposit`)}>
                Try Again
              </Button>
            )}
            <Button
              variant={isSuccess ? "default" : "outline"}
              onClick={() => router.push(`/orders/${orderId}`)}
            >
              Back to Order
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
