"use client";

import { useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { EarningsBreakdown } from "@/components/earnings/earnings-breakdown";
import { EarningsSummaryCard } from "@/components/earnings/earnings-summary-card";
import {
  PeriodFilter,
  usePeriodRange,
  type PeriodKey,
} from "@/components/earnings/period-filter";
import { PayoutAccountManager } from "@/components/earnings/payout-account-manager";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useEarningsSummary } from "@/lib/hooks/use-earnings";

export default function EarningsPage() {
  const { user, isReady } = useAuthGuard({
    requireOnboarded: true,
    requireDesigner: true,
  });

  const [period, setPeriod] = useState<PeriodKey>("month");
  const range = usePeriodRange(period);

  const { summary, loading } = useEarningsSummary(range.from, range.to);

  if (!isReady || !user) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-5 w-72" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-7">
        <header>
          <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
            Reports
          </p>
          <h1 className="text-display mt-2 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            Earnings
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-base">
            What you&rsquo;ve earned through Nidlo, broken down per order. Nidlo
            doesn&rsquo;t hold your money — payments flow straight to your MoMo
            as soon as a client pays.
          </p>
        </header>

        <PeriodFilter value={period} onChange={setPeriod} />

        <EarningsSummaryCard
          summary={summary}
          periodLabel={range.label}
          loading={loading}
        />

        <EarningsBreakdown rows={summary?.breakdown ?? []} loading={loading} />

        <PayoutAccountManager />
      </div>
    </AppShell>
  );
}
