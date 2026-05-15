"use client";

import { ArrowDownToLine, Coins, Hourglass, Receipt } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { formatPesewas } from "@/lib/utils/order";
import { cn } from "@/lib/utils";
import type { GqlEarningsSummary } from "@/types/graphql";

interface Props {
  summary: GqlEarningsSummary | null;
  periodLabel: string;
  loading: boolean;
}

// Headline tile + four supporting stats. Replaces the old "Available
// balance" hero card - Nidlo doesn't hold a balance, so we show what
// actually moved in the period and what's stuck because the designer
// hasn't registered a payout account.
export function EarningsSummaryCard({ summary, periodLabel, loading }: Props) {
  const empty = summary === null || summary.ordersCount === 0;

  return (
    <GlassCard
      variant="solid"
      className="bg-thread-mesh relative overflow-hidden p-6 sm:p-8"
    >
      <div
        className="via-copper/40 pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent"
        aria-hidden
      />
      <div className="text-copper flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase">
        <Coins className="h-3.5 w-3.5" aria-hidden />
        Net earned · {periodLabel}
      </div>
      <p
        className="text-display mt-3 text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl"
        aria-busy={loading}
      >
        {formatPesewas(summary?.netPesewas ?? 0)}
      </p>
      <p className="text-muted-foreground mt-2 text-sm">
        {empty
          ? "No orders settled in this period yet."
          : `From ${summary!.ordersCount} ${summary!.ordersCount === 1 ? "order" : "orders"} after the platform fee.`}
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat
          icon={<Receipt className="h-3.5 w-3.5" aria-hidden />}
          label="Gross paid by clients"
          value={formatPesewas(summary?.grossPesewas ?? 0)}
        />
        <Stat
          icon={<ArrowDownToLine className="h-3.5 w-3.5" aria-hidden />}
          label="Reached your MoMo"
          value={formatPesewas(summary?.paidOutPesewas ?? 0)}
          tone="success"
        />
        <Stat
          icon={<Hourglass className="h-3.5 w-3.5" aria-hidden />}
          label="Awaiting payout setup"
          value={formatPesewas(summary?.awaitingPayoutSetupPesewas ?? 0)}
          tone={
            (summary?.awaitingPayoutSetupPesewas ?? 0) > 0 ? "warn" : "muted"
          }
        />
      </dl>
    </GlassCard>
  );
}

function Stat({
  icon,
  label,
  value,
  tone = "muted",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "muted" | "success" | "warn";
}) {
  return (
    <div className="bg-background/50 ring-border rounded-xl p-3 ring-1">
      <dt
        className={cn(
          "flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase",
          tone === "success" && "text-status-success-fg",
          tone === "warn" && "text-status-warning-fg",
          tone === "muted" && "text-muted-foreground"
        )}
      >
        {icon}
        {label}
      </dt>
      <dd className="text-display mt-1.5 text-base font-semibold tracking-tight tabular-nums sm:text-lg">
        {value}
      </dd>
    </div>
  );
}
