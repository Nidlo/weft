"use client";

import { ArrowDownLeft, ArrowUpRight, Receipt } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { useWalletTransactions } from "@/lib/hooks/use-wallet";
import { formatPesewas } from "@/lib/utils/order";
import { cn } from "@/lib/utils";

export function WalletTransactions() {
  const { transactions, loading } = useWalletTransactions();

  return (
    <section>
      <header className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
          Activity
        </p>
        <h2 className="text-display mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
          Transaction history
        </h2>
      </header>

      {loading && transactions.length === 0 ? (
        <GlassCard variant="ghost" className="p-4">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </GlassCard>
      ) : transactions.length === 0 ? (
        <GlassCard
          variant="solid"
          className="flex flex-col items-center py-12 text-center"
        >
          <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-foreground">
            <Receipt className="h-6 w-6" aria-hidden />
          </span>
          <h3 className="text-display mt-4 text-xl font-semibold tracking-tight">
            No transactions yet.
          </h3>
          <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted-foreground">
            Your earnings and withdrawals will appear here as soon as your
            first order is paid.
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => {
            const isDeposit = tx.type === "deposit";
            const meta = tx.meta as Record<string, string> | null;
            const label = getTransactionLabel(meta?.type);

            return (
              <GlassCard
                key={tx.id}
                variant="solid"
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl ring-1",
                      isDeposit
                        ? "bg-status-success-soft text-status-success ring-status-success/20"
                        : "bg-status-error-soft text-status-error ring-status-error/20"
                    )}
                  >
                    {isDeposit ? (
                      <ArrowDownLeft className="h-4 w-4" aria-hidden />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" aria-hidden />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-display truncate text-sm font-semibold tracking-tight">
                      {label}
                    </p>
                    <p className="text-xs text-muted-foreground tabular-nums">
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
                  className={cn(
                    "shrink-0 text-sm font-semibold tabular-nums",
                    isDeposit
                      ? "text-status-success-fg"
                      : "text-status-error-fg"
                  )}
                >
                  {isDeposit ? "+" : "−"}
                  {formatPesewas(tx.amount)}
                </p>
              </GlassCard>
            );
          })}
        </div>
      )}
    </section>
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
