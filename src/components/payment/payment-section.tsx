"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import type { GqlPayment, GqlPaymentSummary, PaymentStatusValue } from "@/types/graphql";
import { formatPesewas } from "@/lib/utils/order";
import { getPaymentStatusConfig, getPaymentMethodConfig, formatPaymentType } from "@/lib/utils/payment";

interface PaymentSectionProps {
  orderId: string;
  confirmedPrice: number;
  payments: GqlPayment[];
  summary: GqlPaymentSummary | null;
  isClient: boolean;
  orderStatus: string;
}

function PaymentRow({ payment }: { payment: GqlPayment }) {
  const statusConfig = getPaymentStatusConfig(payment.status);
  const methodConfig = getPaymentMethodConfig(payment.method);

  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium">{formatPaymentType(payment.type)}</p>
        <p className="text-xs text-muted-foreground">
          {methodConfig.shortLabel}
          {payment.paidAt && (
            <> &middot; {new Date(payment.paidAt).toLocaleDateString()}</>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">{formatPesewas(payment.amount)}</span>
        <Badge
          variant="secondary"
          className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}
        >
          {statusConfig.label}
        </Badge>
      </div>
    </div>
  );
}

export function PaymentSection({
  orderId,
  confirmedPrice,
  payments,
  summary,
  isClient,
  orderStatus,
}: PaymentSectionProps) {
  const depositAmount = summary?.depositAmount ?? Math.ceil(confirmedPrice / 2);
  const balanceAmount = summary?.balanceAmount ?? confirmedPrice - depositAmount;
  const depositStatus = summary?.depositStatus as PaymentStatusValue | null;
  const balanceStatus = summary?.balanceStatus as PaymentStatusValue | null;

  const canPayDeposit = isClient && depositStatus !== "success" && depositStatus !== "pending";
  const canPayBalance =
    isClient &&
    depositStatus === "success" &&
    balanceStatus !== "success" &&
    balanceStatus !== "pending";

  // Don't show payment section for cancelled/declined orders or orders without confirmed price
  const hiddenStatuses = ["cancelled", "declined", "pending"];
  if (hiddenStatuses.includes(orderStatus) || !confirmedPrice) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-4 w-4" />
          Payments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Deposit (50%)</p>
            <p className="text-sm font-semibold">{formatPesewas(depositAmount)}</p>
            {depositStatus && (
              <Badge
                variant="secondary"
                className={`mt-1 ${getPaymentStatusConfig(depositStatus).bgColor} ${getPaymentStatusConfig(depositStatus).color} border-0`}
              >
                {getPaymentStatusConfig(depositStatus).label}
              </Badge>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Balance (50%)</p>
            <p className="text-sm font-semibold">{formatPesewas(balanceAmount)}</p>
            {balanceStatus && (
              <Badge
                variant="secondary"
                className={`mt-1 ${getPaymentStatusConfig(balanceStatus).bgColor} ${getPaymentStatusConfig(balanceStatus).color} border-0`}
              >
                {getPaymentStatusConfig(balanceStatus).label}
              </Badge>
            )}
          </div>
        </div>

        {/* Payment history */}
        {payments.length > 0 && (
          <div className="border-t pt-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Payment History</p>
            <div className="divide-y">
              {payments.map((p) => (
                <PaymentRow key={p.id} payment={p} />
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        {(canPayDeposit || canPayBalance) && (
          <div className="flex gap-2 pt-2">
            {canPayDeposit && (
              <Button asChild className="flex-1">
                <Link href={`/orders/${orderId}/pay?type=deposit`}>
                  Pay Deposit ({formatPesewas(depositAmount)})
                </Link>
              </Button>
            )}
            {canPayBalance && (
              <Button asChild className="flex-1">
                <Link href={`/orders/${orderId}/pay?type=balance`}>
                  Pay Balance ({formatPesewas(balanceAmount)})
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
