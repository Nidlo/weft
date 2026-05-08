"use client";

import Link from "next/link";
import { Bell, MessageSquare, LogOut, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NidloMark } from "@/components/brand/nidlo-mark";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuthStore } from "@/lib/stores/auth";
import { useMessagesStore } from "@/lib/stores/messages";
import { useNotificationsStore } from "@/lib/stores/notifications";
import { useLogout } from "@/lib/hooks/use-logout";
import { cn } from "@/lib/utils";

export function Header() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  // FE-NIDLO-AUTH-21 / audit H13 — disable + spin during logout to
  // prevent double-click on slow networks.
  const { logout: handleLogout, loading: loggingOut } = useLogout();
  const unreadCount = useMessagesStore((s) => s.unreadCount);
  const notifUnread = useNotificationsStore((s) => s.unreadCount);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/50",
        "bg-background/70 backdrop-blur-xl backdrop-saturate-150",
        "supports-backdrop-filter:bg-background/55"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href={isAuthenticated ? "/dashboard" : "/"}
          className="flex min-h-11 items-center gap-1 outline-none transition-opacity hover:opacity-80 focus-visible:opacity-80"
          aria-label="Nidlo home"
        >
          <NidloMark variant="wordmark" size={30} />
        </Link>

        {!_hasHydrated ? (
          /* Pre-hydration — reserve width to avoid layout flash */
          <div className="h-9 w-32" aria-hidden />
        ) : isAuthenticated ? (
          <div className="flex items-center gap-1 sm:gap-2">
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
                  <Pip count={unreadCount} />
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
                {notifUnread > 0 && <Pip count={notifUnread} />}
              </Link>
            </Button>
            <ThemeToggle className="hidden md:flex" />
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
              title={loggingOut ? "Signing out..." : "Log out"}
              aria-label={loggingOut ? "Signing out" : "Log out"}
              aria-busy={loggingOut}
            >
              {loggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
            </Button>
            {/* Mobile — only theme toggle, rest lives in MobileNav */}
            <ThemeToggle className="md:hidden" size="icon-sm" />
          </div>
        ) : (
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle size="icon-sm" />
            <Button variant="ghost" size="sm" className="min-h-11" asChild>
              <Link href="/auth/phone">Log in</Link>
            </Button>
            <Button variant="luxe" size="sm" className="min-h-11" asChild>
              <Link href="/auth/phone">Get started</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

function Pip({ count }: { count: number }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-copper px-1 text-[10px] font-semibold text-foreground ring-2 ring-background">
      {count > 99 ? "99+" : count}
    </span>
  );
}
