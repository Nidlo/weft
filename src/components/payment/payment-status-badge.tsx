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
      <Badge variant="secondary" className="shrink-0 border-0 bg-green-100 text-green-700">
        Fully Paid
      </Badge>
    );
  }

  if (depositStatus === "success") {
    return (
      <Badge variant="secondary" className="shrink-0 border-0 bg-blue-100 text-blue-700">
        Deposit Paid
      </Badge>
    );
  }

  if (depositStatus === "pending") {
    return (
      <Badge variant="secondary" className="shrink-0 border-0 bg-yellow-100 text-yellow-700">
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
