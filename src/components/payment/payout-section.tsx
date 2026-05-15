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
  pending: {
    label: "Pending",
    color: "text-status-warning-fg",
    bgColor: "bg-status-warning-soft",
  },
  processing: {
    label: "Processing",
    color: "text-status-info-fg",
    bgColor: "bg-status-info-soft",
  },
  success: {
    label: "Paid",
    color: "text-status-success-fg",
    bgColor: "bg-status-success-soft",
  },
  failed: {
    label: "Failed",
    color: "text-status-error-fg",
    bgColor: "bg-status-error-soft",
  },
  wallet_pending: {
    label: "Awaiting Wallet",
    color: "text-status-warning-fg",
    bgColor: "bg-status-warning-soft",
  },
};

function getPayoutStatusConfig(status: string) {
  return (
    PAYOUT_STATUS_CONFIG[status as PayoutStatusValue] ?? {
      label: status,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    }
  );
}

interface PayoutSectionProps {
  orderId: string;
  payouts: GqlPayout[];
  isDesigner: boolean;
}

export function PayoutSection({
  orderId,
  payouts,
  isDesigner,
}: PayoutSectionProps) {
  const { requestPayout, loading: retrying } = useRequestPayout(orderId);
  const [retryError, setRetryError] = useState<string | null>(null);

  if (payouts.length === 0) return null;

  const handleRetry = async (payoutId: string) => {
    setRetryError(null);
    try {
      await requestPayout(payoutId);
    } catch (err) {
      setRetryError(
        err instanceof Error ? err.message : "Retry failed. Please try again."
      );
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
          <div className="border-destructive/20 bg-destructive/5 text-destructive rounded-lg border p-2 text-xs">
            {retryError}
          </div>
        )}
        <div className="divide-y">
          {payouts.map((payout) => {
            const statusConfig = getPayoutStatusConfig(payout.status);
            return (
              <div
                key={payout.id}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <p className="text-sm font-medium">
                    {formatPesewas(payout.netAmount)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Fee: {formatPesewas(payout.platformFee)} (
                    {
                      /* feeRate is basis points (1000 = 10.00%) */ payout.feeRate /
                        100
                    }
                    %)
                    {payout.transferredAt && (
                      <>
                        {" "}
                        &middot;{" "}
                        {new Date(payout.transferredAt).toLocaleDateString()}
                      </>
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
                      loading={retrying}
                      loadingLabel="Retrying..."
                    >
                      <RefreshCw className="mr-1 h-3 w-3" />
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
