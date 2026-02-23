"use client";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";

export default function OrdersPage() {
  const { user, isReady } = useAuthGuard({ requireOnboarded: true });

  if (!isReady || !user) {
    return (
      <AppShell>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">
            {user.isDesigner
              ? "Manage incoming orders and track production"
              : "Track your garment orders and their progress"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="h-5 w-5" />
              Orders
              <Badge variant="secondary">Coming in Sprint 4</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Order tracking with 7-stage progress, timeline updates, and
              messaging will be available once you place your first order.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              To place an order, browse designers and use the{" "}
              <strong>Request Quote</strong> button on their profile.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
