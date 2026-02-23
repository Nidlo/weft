"use client";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
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
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Chat with {user.isDesigner ? "your clients" : "your designers"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5" />
              Conversations
              <Badge variant="secondary">Coming in Sprint 5</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Real-time messaging with text, photos, and read receipts will be
              available here. You&apos;ll be able to discuss order details, share
              progress photos, and coordinate directly.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
