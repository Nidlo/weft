"use client";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { WalletManager } from "@/components/wallet/wallet-manager";
import { WalletTransactions } from "@/components/wallet/wallet-transactions";

export default function WalletPage() {
  const { user, isReady } = useAuthGuard({
    requireOnboarded: true,
    requireDesigner: true,
  });

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
            Earnings
          </p>
          <h1 className="text-display mt-2 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            Wallet
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-base">
            Manage your MoMo payout accounts and review every transaction —
            order earnings in, withdrawals out.
          </p>
        </header>
        <WalletManager />
        <WalletTransactions />
      </div>
    </AppShell>
  );
}
