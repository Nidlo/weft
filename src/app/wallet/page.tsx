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
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Wallet</h1>
          <p className="text-muted-foreground">
            Manage your payout accounts and view transactions
          </p>
        </div>
        <WalletManager />
        <WalletTransactions />
      </div>
    </AppShell>
  );
}
