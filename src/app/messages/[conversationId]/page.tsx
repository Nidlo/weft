"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { ArrowLeft, ArrowUpRight, Loader2 } from "lucide-react";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import {
  useConversationMessages,
  useMarkMessagesRead,
  useSendMessage,
} from "@/lib/hooks/use-messages";
import { useRealtime } from "@/providers/realtime-provider";
import { useEchoReconnect } from "@/lib/hooks/use-echo-reconnect";
import { useMessagesStore } from "@/lib/stores/messages";
import { AppShell } from "@/components/layout/app-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageBubble } from "@/components/messages/message-bubble";
import { ChatInput } from "@/components/messages/chat-input";
import { DateSeparator } from "@/components/messages/date-separator";
import { getImageKitThumbnail } from "@/lib/utils/imagekit";
import { MY_CONVERSATIONS } from "@/lib/graphql/queries/message";
import type { GqlMessage, MyConversationsData } from "@/types/graphql";

export default function ChatPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = use(params);
  const { user, isReady } = useAuthGuard({ requireOnboarded: true });
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { echo } = useRealtime();
  const decrementUnread = useMessagesStore((s) => s.decrementUnreadCount);
  const setActiveConversation = useMessagesStore(
    (s) => s.setActiveConversation
  );
  const hasMarkedRead = useRef(false);

  // Track active conversation so RealtimeProvider skips unread increment
  useEffect(() => {
    setActiveConversation(conversationId);
    return () => setActiveConversation(null);
  }, [conversationId, setActiveConversation]);

  // Get conversation metadata from cache
  const { data: convData } = useQuery<MyConversationsData>(MY_CONVERSATIONS, {
    fetchPolicy: "cache-first",
  });
  const conversation = convData?.myConversations.find(
    (c) => c.id === conversationId
  );

  const { messages, hasMore, loading, loadMore, refetch } =
    useConversationMessages(conversationId);
  const { sendMessage, loading: sending } = useSendMessage();
  const { markRead } = useMarkMessagesRead();

  // Mark messages as read once on mount
  useEffect(() => {
    if (hasMarkedRead.current || !isReady || !user || !conversationId) return;
    hasMarkedRead.current = true;
    markRead(conversationId);
    if (conversation?.unreadCount) {
      decrementUnread(conversation.unreadCount);
    }
  }, [
    isReady,
    user,
    conversationId,
    markRead,
    conversation?.unreadCount,
    decrementUnread,
  ]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Bump on reconnect so the subscription effect below re-runs and
  // re-joins the conversation channel against the fresh socket. Without
  // this, after a network blip the listener stays bound to the old
  // socket and quietly misses any messages that arrive after reconnect.
  const [reconnectVersion, setReconnectVersion] = useState(0);

  // Subscribe to new messages via WebSocket. We debounce the read mutation
  // because a burst of incoming messages would otherwise fire one POST per
  // arrival - the server only needs to know "the user is in this thread,
  // mark everything visible". 250ms collapses bursts without making the
  // sender wait too long for the read receipt.
  const markReadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!echo || !conversationId) return;

    const channel = echo.private(`conversation.${conversationId}`);

    channel.listen(".message.sent", (data: GqlMessage) => {
      // Skip events authored by the current user - they're already in the
      // optimistic cache and don't need a refetch / read-receipt round-trip.
      if (data.senderId === user?.id) return;
      refetch();
      if (markReadTimerRef.current) clearTimeout(markReadTimerRef.current);
      markReadTimerRef.current = setTimeout(() => {
        markRead(conversationId);
      }, 250);
    });

    channel.listen(".messages.read", () => {
      refetch();
    });

    return () => {
      if (markReadTimerRef.current) clearTimeout(markReadTimerRef.current);
      echo.leave(`conversation.${conversationId}`);
    };
  }, [echo, conversationId, user?.id, refetch, markRead, reconnectVersion]);

  // Refetch + bump the channel-subscription version when the socket
  // reconnects. Refetch fills the message-list gap; the version bump
  // forces a clean re-join of the private channel above.
  const handleReconnect = useCallback(() => {
    refetch();
    setReconnectVersion((v) => v + 1);
  }, [refetch]);
  useEchoReconnect(echo, handleReconnect);

  // Handle scroll to top for loading more messages
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || !hasMore || loading) return;
    if (container.scrollTop < 100) {
      loadMore();
    }
  }, [hasMore, loading, loadMore]);

  const handleSend = async (body?: string, mediaUrl?: string) => {
    await sendMessage({
      conversationId,
      body: body || undefined,
      mediaUrl: mediaUrl || undefined,
    });
  };

  // Hooks must run on every render — keep useMemo above any early return.
  const messagesByDate = useMemo(() => {
    const displayMessages = [...messages].reverse();
    const groups: { date: string; msgs: typeof displayMessages }[] = [];
    let currentDate = "";
    for (const msg of displayMessages) {
      const msgDate = new Date(msg.createdAt).toDateString();
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msg.createdAt, msgs: [] });
      }
      groups[groups.length - 1].msgs.push(msg);
    }
    return groups;
  }, [messages]);

  const other =
    conversation?.designerId === user?.id
      ? conversation?.client
      : conversation?.designer;

  if (!isReady || !user) {
    return (
      <AppShell>
        <div className="space-y-4">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="-mx-4 flex h-[calc(100dvh-4rem-4rem)] flex-col sm:-mx-6 md:mx-0 md:h-[calc(100dvh-4rem-1rem)]">
        {/* Chat header — glass surface, sticky to the top of the chat */}
        <header className="flex items-center gap-3 border-b border-border/60 bg-background/70 px-3 py-3 backdrop-blur-xl backdrop-saturate-150 sm:px-4">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Back to messages"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {other ? (
            <>
              <Avatar className="size-10 shrink-0 ring-1 ring-border">
                {other.avatarUrl && (
                  <AvatarImage
                    src={getImageKitThumbnail(other.avatarUrl, 80)}
                    alt={other.fullName ?? ""}
                  />
                )}
                <AvatarFallback className="bg-secondary text-sm font-medium">
                  {(other.fullName ?? "?").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-display truncate text-base font-semibold tracking-tight">
                  {other.fullName}
                </p>
                {conversation?.order && (
                  <Link
                    href={`/orders/${conversation.order.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    View order
                    <ArrowUpRight className="h-3 w-3" aria-hidden />
                  </Link>
                )}
              </div>
            </>
          ) : (
            <Skeleton className="h-9 w-32" />
          )}
        </header>

        {/* Messages area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 space-y-2 overflow-y-auto px-3 py-5 sm:px-4"
        >
          {hasMore && (
            <div className="flex justify-center py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadMore}
                disabled={loading}
                className="text-muted-foreground"
              >
                {loading && (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                )}
                Load older messages
              </Button>
            </div>
          )}

          {messagesByDate.map((group) => (
            <div key={group.date}>
              <DateSeparator date={group.date} />
              <div className="space-y-0.5">
                {group.msgs.map((msg, idx) => {
                  const next = group.msgs[idx + 1];
                  const isGroupTail = !next || next.senderId !== msg.senderId;
                  return (
                    <div key={msg.id} className={isGroupTail ? "mb-2" : ""}>
                      <MessageBubble
                        message={msg}
                        isOwn={msg.senderId === user.id}
                        showReadReceipt={msg.senderId === user.id}
                        isGroupTail={isGroupTail}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-display text-2xl font-semibold tracking-tight">
                Say hello.
              </p>
              <p className="mt-2 max-w-xs text-pretty text-sm text-muted-foreground">
                This is the start of your conversation. Share details, ask
                questions, send photos.
              </p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <ChatInput onSend={handleSend} sending={sending} />
      </div>
    </AppShell>
  );
}
