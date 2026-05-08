"use client";

import { Suspense, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { usePaymentStatus } from "@/lib/hooks/use-payments";
import { AppShell } from "@/components/layout/app-shell";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StitchLoader } from "@/components/ui/stitch-loader";
import { formatPesewas } from "@/lib/utils/order";

export default function PaymentCallbackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="flex flex-col items-center space-y-4 py-16 text-center">
            <StitchLoader size={32} tone="copper" />
            <p className="text-sm text-muted-foreground">
              Verifying your payment...
            </p>
          </div>
        </AppShell>
      }
    >
      <PaymentCallbackContent params={params} />
    </Suspense>
  );
}

function PaymentCallbackContent({
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

  if (!isReady || loading || !payment) {
    return (
      <AppShell>
        <div className="flex flex-col items-center space-y-4 py-16 text-center">
          <StitchLoader size={32} tone="copper" />
          <p className="text-sm text-muted-foreground">
            Verifying your payment&hellip;
          </p>
        </div>
      </AppShell>
    );
  }

  // The reference comes from the gateway via URL — without this guard, a
  // user holding any successful reference URL could render the success
  // page on someone else's /orders/<id>/pay/callback. Tie the reference
  // back to the order in the path.
  const referenceMatchesOrder =
    payment !== null && payment !== undefined && payment.orderId === orderId;
  const isSuccess = referenceMatchesOrder && payment?.status === "success";

  if (!referenceMatchesOrder) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md">
          <div className="flex flex-col items-center space-y-6 py-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-status-error-soft">
              <XCircle className="h-10 w-10 text-status-error" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">We couldn&apos;t verify that payment</h2>
              <p className="text-sm text-muted-foreground">
                This confirmation link doesn&apos;t match this order. Open the order to
                check its current payment status.
              </p>
            </div>
            <Button onClick={() => router.push(`/orders/${orderId}`)}>
              Back to Order
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-md">
        <div className="flex flex-col items-center space-y-6 py-8 text-center">
          {isSuccess ? (
            <>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-status-success-soft">
                <CheckCircle2 className="h-10 w-10 text-status-success" />
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
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-status-error-soft">
                <XCircle className="h-10 w-10 text-status-error" />
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
