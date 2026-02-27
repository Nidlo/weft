"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type Echo from "laravel-echo";
import { useApolloClient } from "@apollo/client/react";
import { useAuthStore } from "@/lib/stores/auth";
import { useMessagesStore } from "@/lib/stores/messages";
import { getEcho, disconnectEcho } from "@/lib/echo";
import { UNREAD_MESSAGES_COUNT } from "@/lib/graphql/queries/message";
import type { UnreadMessagesCountData } from "@/types/graphql";

interface RealtimeContextValue {
  echo: Echo<"reverb"> | null;
}

const RealtimeContext = createContext<RealtimeContextValue>({ echo: null });

export function useRealtime() {
  return useContext(RealtimeContext);
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const userId = useAuthStore((s) => s.user?.id);
  const setUnreadCount = useMessagesStore((s) => s.setUnreadCount);
  const incrementUnread = useMessagesStore((s) => s.incrementUnreadCount);
  const apolloClient = useApolloClient();
  const echoRef = useRef<Echo<"reverb"> | null>(null);
  const [echoState, setEchoState] = useState<Echo<"reverb"> | null>(null);

  // Fetch unread count once on authentication
  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || !userId) return;

    apolloClient
      .query<UnreadMessagesCountData>({
        query: UNREAD_MESSAGES_COUNT,
        fetchPolicy: "network-only",
      })
      .then(({ data }) => {
        if (data?.unreadMessagesCount !== undefined) {
          setUnreadCount(data.unreadMessagesCount);
        }
      })
      .catch(() => {
        // Silently fail — badge will show 0
      });
  }, [hasHydrated, isAuthenticated, userId, apolloClient, setUnreadCount]);

  // Set up WebSocket connection and subscriptions
  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || !userId) {
      disconnectEcho();
      echoRef.current = null;
      setEchoState(null);
      return;
    }

    const echo = getEcho();
    echoRef.current = echo;
    setEchoState(echo);

    if (!echo) return;

    // Subscribe to user's private channel for real-time unread count updates
    echo
      .private(`user.${userId}`)
      .listen(".message.sent", (data: { conversationId?: string }) => {
        // Don't increment if user is actively viewing this conversation
        const activeId = useMessagesStore.getState().activeConversationId;
        if (data.conversationId && data.conversationId === activeId) return;
        incrementUnread();
      });

    return () => {
      echo.leave(`user.${userId}`);
    };
  }, [hasHydrated, isAuthenticated, userId, incrementUnread]);

  return (
    <RealtimeContext.Provider value={{ echo: echoState }}>
      {children}
    </RealtimeContext.Provider>
  );
}
