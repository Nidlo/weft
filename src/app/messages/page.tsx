"use client";

import { useEffect } from "react";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useConversations } from "@/lib/hooks/use-messages";
import { useRealtime } from "@/providers/realtime-provider";
import { useEchoReconnect } from "@/lib/hooks/use-echo-reconnect";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { ConversationListItem } from "@/components/messages/conversation-list-item";
import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  const { user, isReady } = useAuthGuard({ requireOnboarded: true });
  const { conversations, loading, refetch } = useConversations();
  const { echo } = useRealtime();

  // Refetch conversations list when a new message arrives on user channel
  useEffect(() => {
    if (!echo || !user?.id) return;

    const channel = echo.private(`user.${user.id}`);
    channel.listen(".message.sent", () => {
      refetch();
    });

    return () => {
      channel.stopListening(".message.sent");
    };
  }, [echo, user?.id, refetch]);

  // Refetch on reconnect — events that fired while the socket was down would
  // otherwise be silent.
  useEchoReconnect(echo, refetch);

  if (!isReady || !user) {
    return (
      <AppShell>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-sm text-muted-foreground">
            Chat with {user.isDesigner ? "your clients" : "your designers"}
          </p>
        </div>

        {loading && conversations.length === 0 ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-lg font-medium">No conversations yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {user.isDesigner
                ? "Conversations will appear here when clients message you about orders."
                : "Start a conversation by messaging a designer from your order page."}
            </p>
          </div>
        ) : (
          <div className="divide-y rounded-lg border">
            {conversations.map((conv) => (
              <ConversationListItem key={conv.id} conversation={conv} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
