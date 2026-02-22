"use client";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user, isReady } = useAuthGuard({ requireOnboarded: true });

  if (!isReady || !user) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-5 w-32" />
          </div>
          <Skeleton className="h-24 w-full" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome{user.firstName ? `, ${user.firstName}` : ""}!
          </h1>
          <p className="text-muted-foreground">
            Your {user.isDesigner ? "designer" : "client"} dashboard
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Dashboard content coming in the next sprint.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
