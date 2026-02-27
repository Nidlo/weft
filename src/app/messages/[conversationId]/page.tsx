"use client";

import { use, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import {
  useConversationMessages,
  useMarkMessagesRead,
  useSendMessage,
} from "@/lib/hooks/use-messages";
import { useRealtime } from "@/providers/realtime-provider";
import { useMessagesStore } from "@/lib/stores/messages";
import { AppShell } from "@/components/layout/app-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageBubble } from "@/components/messages/message-bubble";
import { ChatInput } from "@/components/messages/chat-input";
import { DateSeparator } from "@/components/messages/date-separator";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getImageKitThumbnail } from "@/lib/utils/imagekit";
import { useQuery } from "@apollo/client/react";
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
  const setActiveConversation = useMessagesStore((s) => s.setActiveConversation);
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
  }, [isReady, user, conversationId, markRead, conversation?.unreadCount, decrementUnread]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Subscribe to new messages via WebSocket
  useEffect(() => {
    if (!echo || !conversationId) return;

    const channel = echo.private(`conversation.${conversationId}`);

    channel.listen(".message.sent", (data: GqlMessage) => {
      if (data.senderId !== user?.id) {
        refetch();
        markRead(conversationId);
      }
    });

    channel.listen(".messages.read", () => {
      refetch();
    });

    return () => {
      echo.leave(`conversation.${conversationId}`);
    };
  }, [echo, conversationId, user?.id, refetch, markRead]);

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

  // Reverse messages for display (API returns newest first, we need oldest first)
  const displayMessages = [...messages].reverse();

  // Group by date for separators
  const messagesByDate: { date: string; msgs: typeof displayMessages }[] = [];
  let currentDate = "";
  for (const msg of displayMessages) {
    const msgDate = new Date(msg.createdAt).toDateString();
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      messagesByDate.push({ date: msg.createdAt, msgs: [] });
    }
    messagesByDate[messagesByDate.length - 1].msgs.push(msg);
  }

  return (
    <AppShell>
      <div className="flex h-[calc(100dvh-3.5rem-4rem)] flex-col md:h-[calc(100dvh-3.5rem-1rem)]">
        {/* Chat header */}
        <div className="flex items-center gap-3 border-b px-2 py-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {other ? (
            <>
              <Avatar className="h-9 w-9">
                {other.avatarUrl && (
                  <AvatarImage
                    src={getImageKitThumbnail(other.avatarUrl, 80)}
                    alt={other.fullName ?? ""}
                  />
                )}
                <AvatarFallback>
                  {(other.fullName ?? "?").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{other.fullName}</p>
                {conversation?.order && (
                  <Link
                    href={`/orders/${conversation.order.id}`}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    View order
                  </Link>
                )}
              </div>
            </>
          ) : (
            <Skeleton className="h-9 w-32" />
          )}
        </div>

        {/* Messages area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 space-y-2 overflow-y-auto px-3 py-4"
        >
          {hasMore && (
            <div className="flex justify-center py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
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

          {displayMessages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-muted-foreground">
                No messages yet. Say hello!
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
