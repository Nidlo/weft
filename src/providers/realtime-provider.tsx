"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type Echo from "laravel-echo";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/auth";
import { useMessagesStore } from "@/lib/stores/messages";
import { useNotificationsStore } from "@/lib/stores/notifications";
import { getEcho, disconnectEcho } from "@/lib/echo";
import { useEchoReconnect } from "@/lib/hooks/use-echo-reconnect";
import { UNREAD_MESSAGES_COUNT } from "@/lib/graphql/queries/message";
import {
  MY_NOTIFICATION_PREFERENCES,
  UNREAD_NOTIFICATIONS_COUNT,
} from "@/lib/graphql/queries/notification";
import { usePushNotifications } from "@/lib/hooks/use-push-notifications";
import type {
  GqlNotificationPreferences,
  MyNotificationPreferencesData,
  UnreadMessagesCountData,
  UnreadNotificationsCountData,
} from "@/types/graphql";

/**
 * Convert a notification type slug like `"message_received"` to the
 * `messageReceived` key on `GqlNotificationPreferences`. Returns null
 * if the prefs object doesn't expose that category - the caller should
 * fall through to "show the toast" rather than silently swallow.
 */
function shouldToast(
  prefs: GqlNotificationPreferences | null | undefined,
  type: string
): boolean {
  if (!prefs) return true;
  const key = type.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()) as
    | keyof GqlNotificationPreferences
    | string;
  const channels = (prefs as unknown as Record<string, unknown>)[key];
  if (
    channels &&
    typeof channels === "object" &&
    "push" in channels &&
    typeof (channels as { push: unknown }).push === "boolean"
  ) {
    return (channels as { push: boolean }).push;
  }
  return true;
}

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
  const setNotifUnread = useNotificationsStore((s) => s.setUnreadCount);
  const incrementNotifUnread = useNotificationsStore((s) => s.incrementUnread);
  const apolloClient = useApolloClient();

  // Register FCM push notifications
  usePushNotifications(hasHydrated && isAuthenticated);

  // Per-category prefs power the in-app toast gate below. The notification
  // service already gates FCM by the same `push` flag server-side, so this
  // closes the in-app side of the same control - no toast shows for
  // categories the user has muted.
  const { data: prefsData } = useQuery<MyNotificationPreferencesData>(
    MY_NOTIFICATION_PREFERENCES,
    {
      skip: !hasHydrated || !isAuthenticated,
      fetchPolicy: "cache-first",
    }
  );
  const prefs = prefsData?.myNotificationPreferences ?? null;

  const echoRef = useRef<Echo<"reverb"> | null>(null);
  const [echoState, setEchoState] = useState<Echo<"reverb"> | null>(null);
  // Bumped each time the socket reconnects so the channel-subscription
  // effect below re-runs (leaving + re-joining the user's private
  // channel). Without this, listeners bound to a pre-disconnect socket
  // are stale and miss events that arrive after reconnect.
  const [reconnectVersion, setReconnectVersion] = useState(0);

  const refreshUnreadCounts = useCallback(() => {
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
        // Silently fail - badge will show 0
      });

    apolloClient
      .query<UnreadNotificationsCountData>({
        query: UNREAD_NOTIFICATIONS_COUNT,
        fetchPolicy: "network-only",
      })
      .then(({ data }) => {
        if (data?.unreadNotificationsCount !== undefined) {
          setNotifUnread(data.unreadNotificationsCount);
        }
      })
      .catch(() => {
        // Silently fail - badge will show 0
      });
  }, [
    hasHydrated,
    isAuthenticated,
    userId,
    apolloClient,
    setUnreadCount,
    setNotifUnread,
  ]);

  // Fetch unread count once on authentication
  useEffect(() => {
    refreshUnreadCounts();
  }, [refreshUnreadCounts]);

  // Re-sync unread counts AND re-subscribe to private channels when the
  // socket reconnects. Increments fired while disconnected are pulled in
  // by `refreshUnreadCounts`; bumping `reconnectVersion` re-runs the
  // channel-subscription effect so its listeners aren't bound to the
  // stale pre-disconnect socket.
  const handleReconnect = useCallback(() => {
    refreshUnreadCounts();
    setReconnectVersion((v) => v + 1);
  }, [refreshUnreadCounts]);
  useEchoReconnect(echoState, handleReconnect);

  // Set up WebSocket connection and subscriptions
  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || !userId) {
      disconnectEcho();
      echoRef.current = null;
      // Defer state reset to a microtask so the setState happens off the
      // synchronous effect path (React 19 cascading-render rule).
      queueMicrotask(() => setEchoState(null));
      return;
    }

    const echo = getEcho();
    echoRef.current = echo;
    queueMicrotask(() => setEchoState(echo));

    if (!echo) return;

    // Subscribe to user's private channel for real-time updates
    echo
      .private(`user.${userId}`)
      .listen(".message.sent", (data: { conversationId?: string }) => {
        // Don't increment if user is actively viewing this conversation
        const activeId = useMessagesStore.getState().activeConversationId;
        if (data.conversationId && data.conversationId === activeId) return;
        incrementUnread();
      })
      .listen(
        ".notification.created",
        (data: { title?: string; body?: string; type?: string }) => {
          // Always bump the badge - the user can still see the
          // notification in /notifications even if they've muted toasts
          // for this category.
          incrementNotifUnread();
          if (!data.title) return;
          if (data.type && !shouldToast(prefs, data.type)) return;
          toast(data.title, { description: data.body });
        }
      );

    return () => {
      echo.leave(`user.${userId}`);
    };
  }, [
    hasHydrated,
    isAuthenticated,
    userId,
    incrementUnread,
    incrementNotifUnread,
    prefs,
    reconnectVersion,
  ]);

  return (
    <RealtimeContext.Provider value={{ echo: echoState }}>
      {children}
    </RealtimeContext.Provider>
  );
}
