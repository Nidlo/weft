"use client";

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWalletTransactions } from "@/lib/hooks/use-wallet";
import { formatPesewas } from "@/lib/utils/order";

export function WalletTransactions() {
  const { transactions, loading } = useWalletTransactions();

  if (loading && transactions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No transactions yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Transaction History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {transactions.map((tx) => {
          const isDeposit = tx.type === "deposit";
          const meta = tx.meta as Record<string, string> | null;
          const label = getTransactionLabel(meta?.type);

          return (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                {isDeposit ? (
                  <ArrowDownLeft className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowUpRight className="h-4 w-4 text-red-500" />
                )}
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleDateString("en-GH", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <p
                className={`text-sm font-semibold ${
                  isDeposit ? "text-green-600" : "text-red-500"
                }`}
              >
                {isDeposit ? "+" : "-"}
                {formatPesewas(tx.amount)}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function getTransactionLabel(metaType?: string): string {
  switch (metaType) {
    case "designer_payout":
      return "Order earnings";
    case "payout_withdrawal":
      return "MoMo withdrawal";
    case "payout_reversal":
      return "Withdrawal reversed";
    case "unclaimed_refund":
      return "Unclaimed refund";
    case "refund_reversal":
      return "Refund reversal";
    default:
      return "Transaction";
  }
}
