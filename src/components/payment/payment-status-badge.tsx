"use client";

import { Badge } from "@/components/ui/badge";
import type { GqlPaymentSummary } from "@/types/graphql";

interface PaymentStatusBadgeProps {
  summary: GqlPaymentSummary | null;
}

export function PaymentStatusBadge({ summary }: PaymentStatusBadgeProps) {
  if (!summary) return null;

  const { depositStatus, balanceStatus } = summary;

  if (depositStatus === "success" && balanceStatus === "success") {
    return (
      <Badge variant="secondary" className="shrink-0 border-0 bg-status-success-soft text-status-success-fg">
        Fully Paid
      </Badge>
    );
  }

  if (depositStatus === "success") {
    return (
      <Badge variant="secondary" className="shrink-0 border-0 bg-status-info-soft text-status-info-fg">
        Deposit Paid
      </Badge>
    );
  }

  if (depositStatus === "pending") {
    return (
      <Badge variant="secondary" className="shrink-0 border-0 bg-status-warning-soft text-status-warning-fg">
        Deposit Pending
      </Badge>
    );
  }

  if (depositStatus === "refunded") {
    return (
      <Badge variant="secondary" className="shrink-0 border-0 bg-gray-100 text-gray-700">
        Refunded
      </Badge>
    );
  }

  return null;
}
