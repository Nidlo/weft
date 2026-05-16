"use client";

import { useEffect } from "react";
import { MessageSquare, Sparkles } from "lucide-react";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useConversations } from "@/lib/hooks/use-messages";
import { useRealtime } from "@/providers/realtime-provider";
import { useEchoReconnect } from "@/lib/hooks/use-echo-reconnect";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import { ConversationListItem } from "@/components/messages/conversation-list-item";

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

  // Refetch on reconnect - events that fired while the socket was down would
  // otherwise be silent.
  useEchoReconnect(echo, refetch);

  if (!isReady || !user) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-3 w-32" />
            <Skeleton className="mt-3 h-10 w-56" />
            <Skeleton className="mt-3 h-5 w-72" />
          </div>
          <GlassCard variant="solid" className="divide-border/60 divide-y p-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </GlassCard>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-7">
        <header data-tour-id="messages.header">
          <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
            Conversations
          </p>
          <h1 className="text-display mt-2 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            Messages
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Chat with {user.isDesigner ? "your clients" : "your designers"}{" "}
            about orders, fittings, and updates.
          </p>
        </header>

        <div data-tour-id="messages.list">
          {loading && conversations.length === 0 ? (
            <GlassCard
              variant="solid"
              className="divide-border/60 divide-y p-2"
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </GlassCard>
          ) : conversations.length === 0 ? (
            <GlassCard
              variant="solid"
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <span className="bg-secondary text-foreground flex size-16 items-center justify-center rounded-2xl">
                <MessageSquare className="h-7 w-7" aria-hidden />
              </span>
              <h2 className="text-display mt-5 text-2xl font-semibold tracking-tight">
                No conversations yet.
              </h2>
              <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm text-pretty">
                {user.isDesigner ? (
                  "Conversations will appear here when clients message you about orders."
                ) : (
                  <>
                    Start one from any{" "}
                    <Sparkles
                      className="text-copper inline h-3.5 w-3.5"
                      aria-hidden
                    />{" "}
                    designer&apos;s order page - they&apos;ll reach out the
                    moment they have an update.
                  </>
                )}
              </p>
            </GlassCard>
          ) : (
            <GlassCard
              variant="solid"
              className="divide-border/60 divide-y overflow-hidden p-0"
            >
              {conversations.map((conv) => (
                <ConversationListItem key={conv.id} conversation={conv} />
              ))}
            </GlassCard>
          )}
        </div>
      </div>
    </AppShell>
  );
}
