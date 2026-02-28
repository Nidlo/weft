"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Banknote, RefreshCw } from "lucide-react";
import type { GqlPayout, PayoutStatusValue } from "@/types/graphql";
import { formatPesewas } from "@/lib/utils/order";
import { useRequestPayout } from "@/lib/hooks/use-payouts";

const PAYOUT_STATUS_CONFIG: Record<
  PayoutStatusValue,
  { label: string; color: string; bgColor: string }
> = {
  pending: { label: "Pending", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  processing: { label: "Processing", color: "text-blue-700", bgColor: "bg-blue-100" },
  success: { label: "Paid", color: "text-green-700", bgColor: "bg-green-100" },
  failed: { label: "Failed", color: "text-red-700", bgColor: "bg-red-100" },
  wallet_pending: { label: "Awaiting Wallet", color: "text-orange-700", bgColor: "bg-orange-100" },
};

function getPayoutStatusConfig(status: string) {
  return (
    PAYOUT_STATUS_CONFIG[status as PayoutStatusValue] ?? {
      label: status,
      color: "text-gray-700",
      bgColor: "bg-gray-100",
    }
  );
}

interface PayoutSectionProps {
  orderId: string;
  payouts: GqlPayout[];
  isDesigner: boolean;
}

export function PayoutSection({ orderId, payouts, isDesigner }: PayoutSectionProps) {
  const { requestPayout, loading: retrying } = useRequestPayout(orderId);
  const [retryError, setRetryError] = useState<string | null>(null);

  if (payouts.length === 0) return null;

  const handleRetry = async (payoutId: string) => {
    setRetryError(null);
    try {
      await requestPayout(payoutId);
    } catch (err) {
      setRetryError(err instanceof Error ? err.message : "Retry failed. Please try again.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Banknote className="h-4 w-4" />
          Designer Payouts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {retryError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-2 text-xs text-destructive">
            {retryError}
          </div>
        )}
        <div className="divide-y">
          {payouts.map((payout) => {
            const statusConfig = getPayoutStatusConfig(payout.status);
            return (
              <div key={payout.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">
                    {formatPesewas(payout.netAmount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Fee: {formatPesewas(payout.platformFee)} ({payout.feeRate / 100}%)
                    {payout.transferredAt && (
                      <> &middot; {new Date(payout.transferredAt).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}
                  >
                    {statusConfig.label}
                  </Badge>
                  {isDesigner && payout.status === "failed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRetry(payout.id)}
                      disabled={retrying}
                    >
                      <RefreshCw className={`mr-1 h-3 w-3 ${retrying ? "animate-spin" : ""}`} />
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
