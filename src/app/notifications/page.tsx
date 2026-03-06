"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  Bell,
  BellOff,
  CheckCheck,
  Package,
  MessageSquare,
  CreditCard,
  Star,
  Wallet,
  Banknote,
  Settings,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MY_NOTIFICATIONS,
  UNREAD_NOTIFICATIONS_COUNT,
} from "@/lib/graphql/queries/notification";
import {
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
} from "@/lib/graphql/mutations/notification";
import { useNotificationsStore } from "@/lib/stores/notifications";
import type {
  GqlNotification,
  MyNotificationsData,
  MarkNotificationReadData,
  MarkAllNotificationsReadData,
} from "@/types/graphql";

const ICON_MAP: Record<string, typeof Bell> = {
  package: Package,
  "message-square": MessageSquare,
  "credit-card": CreditCard,
  star: Star,
  wallet: Wallet,
  banknote: Banknote,
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function NotificationsPage() {
  const { user, isReady } = useAuthGuard({ requireOnboarded: true });
  const router = useRouter();
  const setUnreadCount = useNotificationsStore((s) => s.setUnreadCount);
  const resetUnread = useNotificationsStore((s) => s.resetUnread);

  const { data, loading, fetchMore } = useQuery<MyNotificationsData>(
    MY_NOTIFICATIONS,
    {
      variables: { first: 20, page: 1 },
      skip: !isReady || !user,
      fetchPolicy: "cache-and-network",
    }
  );

  const [markRead] =
    useMutation<MarkNotificationReadData>(MARK_NOTIFICATION_READ);

  const [markAllRead, { loading: markingAll }] =
    useMutation<MarkAllNotificationsReadData>(MARK_ALL_NOTIFICATIONS_READ);

  // Sync unread count on load
  useEffect(() => {
    if (!data) return;
    const unreadOnPage = data.myNotifications.data.filter(
      (n) => !n.readAt
    ).length;
    if (
      unreadOnPage === 0 &&
      !data.myNotifications.paginatorInfo.hasMorePages
    ) {
      setUnreadCount(0);
    }
  }, [data, setUnreadCount]);

  const handleNotificationClick = useCallback(
    async (notification: GqlNotification) => {
      if (!notification.readAt) {
        try {
          await markRead({ variables: { id: notification.id } });
        } catch {
          // Silently fail
        }
      }
      if (notification.actionUrl) {
        router.push(notification.actionUrl);
      }
    },
    [markRead, router]
  );

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllRead({
        refetchQueries: [
          { query: MY_NOTIFICATIONS, variables: { first: 20, page: 1 } },
          { query: UNREAD_NOTIFICATIONS_COUNT },
        ],
      });
      resetUnread();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  }, [markAllRead, resetUnread]);

  const loadMore = useCallback(() => {
    if (!data?.myNotifications.paginatorInfo.hasMorePages) return;
    const currentPage = Math.ceil(data.myNotifications.data.length / 20);
    fetchMore({
      variables: { page: currentPage + 1 },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          myNotifications: {
            ...fetchMoreResult.myNotifications,
            data: [
              ...prev.myNotifications.data,
              ...fetchMoreResult.myNotifications.data,
            ],
          },
        };
      },
    });
  }, [data, fetchMore]);

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

  const notifications = data?.myNotifications.data ?? [];
  const hasMore = data?.myNotifications.paginatorInfo.hasMorePages ?? false;
  const hasUnread = notifications.some((n) => !n.readAt);

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              Stay updated on your orders and activity
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasUnread && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={markingAll}
              >
                {markingAll ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCheck className="mr-1.5 h-4 w-4" />
                )}
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/notifications/preferences">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Notification List */}
        {loading && notifications.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BellOff className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-medium">No notifications yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              When you get order updates, messages, or payments,
              they&apos;ll show up here.
            </p>
          </div>
        ) : (
          <div className="divide-y rounded-lg border">
            {notifications.map((notification) => {
              const IconComponent = ICON_MAP[notification.typeIcon] ?? Bell;
              const isUnread = !notification.readAt;

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50"
                >
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      isUnread
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm ${
                          isUnread ? "font-semibold" : "font-medium"
                        }`}
                      >
                        {notification.title}
                      </span>
                      {isUnread && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                      {notification.body}
                    </p>
                    <span className="mt-1 text-xs text-muted-foreground">
                      {timeAgo(notification.createdAt)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center py-4">
            <Button variant="outline" size="sm" onClick={loadMore}>
              Load more
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
