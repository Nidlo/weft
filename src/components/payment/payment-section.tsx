"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle2 } from "lucide-react";
import type {
  GqlPayment,
  GqlPaymentSummary,
  PaymentStatusValue,
} from "@/types/graphql";
import { formatPesewas } from "@/lib/utils/order";
import {
  getPaymentStatusConfig,
  getPaymentMethodConfig,
  formatPaymentType,
} from "@/lib/utils/payment";

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
  const isRefunded = !!payment.refundedAt;

  return (
    <div className="flex flex-col gap-1 py-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">
            {formatPaymentType(payment.type)}
          </p>
          <p className="text-muted-foreground text-xs">
            {methodConfig.shortLabel}
            {payment.paidAt && (
              <> &middot; {new Date(payment.paidAt).toLocaleDateString()}</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            {formatPesewas(payment.amount)}
          </span>
          <Badge
            variant="secondary"
            className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}
          >
            {statusConfig.label}
          </Badge>
        </div>
      </div>
      {isRefunded && (
        <div className="bg-status-info-soft text-status-info-fg flex items-center gap-1 rounded-md px-2 py-1 text-xs">
          <span>
            Refunded {new Date(payment.refundedAt!).toLocaleDateString()}
          </span>
          {payment.refundReason && (
            <span className="truncate">&middot; {payment.refundReason}</span>
          )}
        </div>
      )}
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
  const balanceAmount =
    summary?.balanceAmount ?? confirmedPrice - depositAmount;
  const depositStatus = summary?.depositStatus as PaymentStatusValue | null;
  const balanceStatus = summary?.balanceStatus as PaymentStatusValue | null;
  const depositOwed = summary?.depositOwed ?? depositAmount;
  const balanceOwed = summary?.balanceOwed ?? balanceAmount;
  const isFullyPaid = summary?.isFullyPaid ?? false;

  const canPayDeposit =
    isClient && depositOwed > 0 && depositStatus !== "pending";
  const canPayBalance =
    isClient &&
    depositOwed === 0 &&
    balanceOwed > 0 &&
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
          {isFullyPaid && (
            <Badge
              variant="secondary"
              className="bg-status-success-soft text-status-success-fg ml-auto border-0"
            >
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Fully Paid
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-muted-foreground text-xs">Deposit (50%)</p>
            <p className="text-sm font-semibold">
              {formatPesewas(depositAmount)}
            </p>
            {depositOwed > 0 && depositOwed < depositAmount && (
              <p className="text-xs text-orange-600">
                Remaining: {formatPesewas(depositOwed)}
              </p>
            )}
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
            <p className="text-muted-foreground text-xs">Balance (50%)</p>
            <p className="text-sm font-semibold">
              {formatPesewas(balanceAmount)}
            </p>
            {balanceOwed > 0 && balanceOwed < balanceAmount && (
              <p className="text-xs text-orange-600">
                Remaining: {formatPesewas(balanceOwed)}
              </p>
            )}
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

        {/* Accounting summary */}
        {summary && summary.totalPaid > 0 && (
          <div className="space-y-1 border-t pt-3 text-sm">
            {summary.totalPaidGateway > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid via app</span>
                <span className="font-medium">
                  {formatPesewas(summary.totalPaidGateway)}
                </span>
              </div>
            )}
            {summary.totalPaidExternal > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Paid offline (confirmed)
                </span>
                <span className="font-medium">
                  {formatPesewas(summary.totalPaidExternal)}
                </span>
              </div>
            )}
            <div className="flex justify-between font-semibold">
              <span>Total Paid</span>
              <span>{formatPesewas(summary.totalPaid)}</span>
            </div>
            {summary.amountRemaining > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>Amount Remaining</span>
                <span className="font-semibold">
                  {formatPesewas(summary.amountRemaining)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Payment history */}
        {payments.length > 0 && (
          <div className="border-t pt-3">
            <p className="text-muted-foreground mb-2 text-xs font-medium">
              Payment History
            </p>
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
                  Pay Deposit ({formatPesewas(depositOwed)})
                </Link>
              </Button>
            )}
            {canPayBalance && (
              <Button asChild className="flex-1">
                <Link href={`/orders/${orderId}/pay?type=balance`}>
                  Pay Balance ({formatPesewas(balanceOwed)})
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
