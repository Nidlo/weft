"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  Banknote,
  Bell,
  BellOff,
  BellRing,
  CheckCheck,
  CreditCard,
  Loader2,
  MessageSquare,
  Package,
  Settings,
  Star,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import {
  MY_NOTIFICATIONS,
  UNREAD_NOTIFICATIONS_COUNT,
} from "@/lib/graphql/queries/notification";
import {
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
} from "@/lib/graphql/mutations/notification";
import { useNotificationsStore } from "@/lib/stores/notifications";
import { usePushPermission } from "@/lib/hooks/use-push-notifications";
import { cn } from "@/lib/utils";
import type {
  GqlNotification,
  MyNotificationsData,
  MarkNotificationReadData,
  MarkAllNotificationsReadData,
} from "@/types/graphql";

const ICON_MAP: Record<string, LucideIcon> = {
  package: Package,
  "message-square": MessageSquare,
  "credit-card": CreditCard,
  star: Star,
  wallet: Wallet,
  banknote: Banknote,
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
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
  const {
    shouldPromptUi: shouldPromptPush,
    requestPermission: requestPushPermission,
  } = usePushPermission();

  const { data, loading, fetchMore } = useQuery<MyNotificationsData>(
    MY_NOTIFICATIONS,
    {
      variables: { first: 20, page: 1 },
      skip: !isReady || !user,
      fetchPolicy: "cache-and-network",
    }
  );

  const [markRead] = useMutation<MarkNotificationReadData>(
    MARK_NOTIFICATION_READ
  );

  const [markAllRead, { loading: markingAll }] =
    useMutation<MarkAllNotificationsReadData>(MARK_ALL_NOTIFICATIONS_READ);

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
        <div className="space-y-6">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-5 w-72" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  const notifications = data?.myNotifications.data ?? [];
  const hasMore = data?.myNotifications.paginatorInfo.hasMorePages ?? false;
  const hasUnread = notifications.some((n) => !n.readAt);

  return (
    <AppShell>
      <div className="space-y-7">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
              Inbox
            </p>
            <h1 className="text-display mt-2 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
              Notifications
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Stay updated on orders, messages, and payments.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:shrink-0">
            {hasUnread && (
              <Button
                variant="luxe-outline"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="gap-1.5"
              >
                {markingAll ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  <CheckCheck className="h-3.5 w-3.5" aria-hidden />
                )}
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="icon" asChild>
              <Link
                href="/notifications/preferences"
                aria-label="Notification preferences"
              >
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </header>

        {/* Push permission prompt */}
        {shouldPromptPush && (
          <GlassCard
            variant="solid"
            className="border-copper/30 bg-copper/5 flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:gap-4"
          >
            <span className="bg-copper/15 text-copper flex size-10 shrink-0 items-center justify-center rounded-xl">
              <BellRing className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-display text-sm font-semibold tracking-tight">
                Enable push notifications
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Get instant alerts for orders, messages, and payments - even
                when Nidlo isn&apos;t open.
              </p>
            </div>
            <Button
              variant="luxe"
              size="sm"
              onClick={() => requestPushPermission()}
              className="self-stretch sm:self-auto"
            >
              Enable
            </Button>
          </GlassCard>
        )}

        {/* Notification list */}
        {loading && notifications.length === 0 ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <GlassCard
            variant="solid"
            className="flex flex-col items-center py-16 text-center"
          >
            <span className="bg-secondary text-foreground flex size-16 items-center justify-center rounded-2xl">
              <BellOff className="h-7 w-7" aria-hidden />
            </span>
            <h2 className="text-display mt-5 text-2xl font-semibold tracking-tight">
              No notifications yet.
            </h2>
            <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm">
              When you get order updates, messages, or payments, they&apos;ll
              show up here.
            </p>
          </GlassCard>
        ) : (
          <GlassCard variant="solid" className="divide-border/60 divide-y p-2">
            {notifications.map((notification) => {
              const IconComponent = ICON_MAP[notification.typeIcon] ?? Bell;
              const isUnread = !notification.readAt;

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "group flex w-full items-start gap-3 rounded-xl px-3 py-3.5 text-left",
                    "hover:bg-card focus-visible:bg-card transition-colors duration-200 focus-visible:outline-none"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-colors",
                      isUnread
                        ? "bg-copper/15 text-copper-soft ring-copper/30"
                        : "bg-secondary text-muted-foreground ring-border"
                    )}
                  >
                    <IconComponent className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <span
                        className={cn(
                          "text-display text-sm tracking-tight",
                          isUnread
                            ? "text-foreground font-semibold"
                            : "text-foreground/80 font-medium"
                        )}
                      >
                        {notification.title}
                      </span>
                      {isUnread && (
                        <span
                          className="bg-copper mt-1.5 size-1.5 shrink-0 rounded-full"
                          aria-hidden
                        />
                      )}
                    </div>
                    <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">
                      {notification.body}
                    </p>
                    <span
                      className={cn(
                        "mt-1 inline-block text-[11px] font-medium tabular-nums",
                        isUnread ? "text-copper" : "text-muted-foreground"
                      )}
                    >
                      {timeAgo(notification.createdAt)}
                    </span>
                  </div>
                </button>
              );
            })}
          </GlassCard>
        )}

        {/* Load more */}
        {hasMore && (
          <div className="flex justify-center pt-2">
            <Button variant="luxe-outline" size="sm" onClick={loadMore}>
              Load more
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
