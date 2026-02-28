"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatPesewas } from "@/lib/utils/order";
import { formatPaymentType } from "@/lib/utils/payment";
import type { PaymentTypeValue } from "@/types/graphql";

interface PaymentResultProps {
  status: "success" | "failed" | "timeout";
  amount: number;
  paymentType: PaymentTypeValue;
  orderId: string;
  onRetry?: () => void;
  onBackToOrder: () => void;
}

export function PaymentResult({
  status,
  amount,
  paymentType,
  orderId,
  onRetry,
  onBackToOrder,
}: PaymentResultProps) {
  return (
    <div className="flex flex-col items-center space-y-6 py-8 text-center">
      {status === "success" && (
        <>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Payment Successful</h2>
            <p className="text-sm text-muted-foreground">
              Your {formatPaymentType(paymentType).toLowerCase()} of{" "}
              <strong>{formatPesewas(amount)}</strong> has been received.
            </p>
          </div>
        </>
      )}

      {status === "failed" && (
        <>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Payment Failed</h2>
            <p className="text-sm text-muted-foreground">
              Your {formatPaymentType(paymentType).toLowerCase()} of{" "}
              <strong>{formatPesewas(amount)}</strong> could not be processed.
              Please try again.
            </p>
          </div>
        </>
      )}

      {status === "timeout" && (
        <>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
            <Clock className="h-10 w-10 text-yellow-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Payment Pending</h2>
            <p className="text-sm text-muted-foreground">
              We haven&apos;t received confirmation yet. If you approved the payment,
              it may take a moment to process.
            </p>
          </div>
        </>
      )}

      <div className="flex gap-3">
        {(status === "failed" || status === "timeout") && onRetry && (
          <Button onClick={onRetry}>Try Again</Button>
        )}
        <Button variant={status === "success" ? "default" : "outline"} onClick={onBackToOrder}>
          Back to Order
        </Button>
      </div>
    </div>
  );
}
