"use client";

import Link from "next/link";
import { Bell, MessageSquare, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/auth";
import { useMessagesStore } from "@/lib/stores/messages";
import { useNotificationsStore } from "@/lib/stores/notifications";
import { useLogout } from "@/lib/hooks/use-logout";

export function Header() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  // `loading` is true while the LOGOUT mutation is in flight — header
  // button shows a spinner + is disabled to prevent double-click on slow
  // networks. (FE-NIDLO-AUTH-21 / audit H13)
  const { logout: handleLogout, loading: loggingOut } = useLogout();
  const unreadCount = useMessagesStore((s) => s.unreadCount);
  const notifUnread = useNotificationsStore((s) => s.unreadCount);

  return (
    <header className="bg-background/95 sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link
          href={isAuthenticated ? "/dashboard" : "/"}
          className="flex items-center gap-2"
        >
          <span className="text-xl font-bold tracking-tight text-primary">
            Nidlo
          </span>
        </Link>

        {!_hasHydrated ? (
          /* Still hydrating — show nothing to avoid flash of login buttons */
          <div className="w-24" />
        ) : isAuthenticated ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative hidden md:flex"
              asChild
            >
              <Link
                href="/messages"
                aria-label={
                  unreadCount > 0
                    ? `Messages, ${unreadCount} unread`
                    : "Messages"
                }
              >
                <MessageSquare className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative hidden md:flex"
              asChild
            >
              <Link
                href="/notifications"
                aria-label={
                  notifUnread > 0
                    ? `Notifications, ${notifUnread} unread`
                    : "Notifications"
                }
              >
                <Bell className="h-5 w-5" />
                {notifUnread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
                    {notifUnread > 99 ? "99+" : notifUnread}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex"
              asChild
            >
              <Link href="/profile">{user?.firstName || "Profile"}</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={handleLogout}
              disabled={loggingOut}
              title={loggingOut ? "Signing out…" : "Log out"}
              aria-label={loggingOut ? "Signing out" : "Log out"}
              aria-busy={loggingOut}
            >
              {loggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/phone">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/phone">Sign up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
