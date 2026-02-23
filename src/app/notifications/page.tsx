"use client";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  const { user, isReady } = useAuthGuard({ requireOnboarded: true });

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
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated on your orders and activity
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5" />
              Activity Feed
              <Badge variant="secondary">Coming in Sprint 8</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Push notifications, SMS alerts, and an in-app notification feed
              will keep you informed about order updates, new messages, payment
              confirmations, and reviews.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
