"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  HelpCircle,
  LogOut,
  Loader2,
  Menu,
  MessageSquare,
  Pencil,
  SlidersHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { NidloMark } from "@/components/brand/nidlo-mark";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { useAuthStore } from "@/lib/stores/auth";
import { useMessagesStore } from "@/lib/stores/messages";
import { useNotificationsStore } from "@/lib/stores/notifications";
import { useLogout } from "@/lib/hooks/use-logout";
import { ReplayMenu } from "@/lib/tour/replay-menu";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <header
      className={cn(
        "border-border/50 sticky top-0 z-50 w-full border-b",
        "bg-background/70 backdrop-blur-xl backdrop-saturate-150",
        "supports-backdrop-filter:bg-background/55"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href={isAuthenticated ? "/dashboard" : "/"}
          className="flex min-h-11 items-center gap-1 transition-opacity outline-none hover:opacity-80 focus-visible:opacity-80"
          aria-label="Nidlo home"
        >
          <NidloMark variant="wordmark" size={30} />
        </Link>

        {!_hasHydrated ? (
          /* Pre-hydration — reserve width to avoid layout flash */
          <div className="h-9 w-32" aria-hidden />
        ) : isAuthenticated ? (
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Desktop actions */}
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
                {unreadCount > 0 && <Pip count={unreadCount} />}
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
            <Popover open={helpOpen} onOpenChange={setHelpOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex"
                  aria-label="Show me around"
                >
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="px-4 pt-4 pb-2">
                  <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
                    Help
                  </p>
                  <h3 className="text-display mt-1 text-base font-semibold tracking-tight">
                    Show me around
                  </h3>
                </div>
                <div className="px-3 pb-3">
                  <ReplayMenu onReplay={() => setHelpOpen(false)} />
                </div>
              </PopoverContent>
            </Popover>
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
              loading={loggingOut}
              title={loggingOut ? "Signing out..." : "Log out"}
              aria-label={loggingOut ? "Signing out" : "Log out"}
            >
              {loggingOut ? null : <LogOut className="h-4 w-4" />}
            </Button>

            {/* Mobile actions: notifications bell + theme + overflow menu.
                Messages + Profile live in the bottom nav, so the header keeps
                the high-frequency surfaces (alerts, theme) one tap away and
                tucks the rest behind a menu. */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="relative md:hidden"
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
            <ThemeToggle className="md:hidden" size="icon-sm" />
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <Button
                variant="ghost"
                size="icon-sm"
                className="md:hidden"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <SheetContent side="bottom" className="px-2 pb-6">
                <SheetHeader className="text-left">
                  <SheetTitle className="text-display text-lg font-semibold tracking-tight">
                    {user?.firstName ? `Hi, ${user.firstName}` : "Account"}
                  </SheetTitle>
                  <SheetDescription>
                    Quick access to your settings.
                  </SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col gap-1 px-2">
                  <MenuRow
                    href="/profile/edit"
                    icon={Pencil}
                    label="Edit profile"
                    description="Name, contact, location, shop"
                    onSelect={() => setMenuOpen(false)}
                  />
                  <MenuRow
                    href="/notifications/preferences"
                    icon={SlidersHorizontal}
                    label="Notification preferences"
                    description="Push, email, SMS, quiet hours"
                    onSelect={() => setMenuOpen(false)}
                  />
                  <MenuRow
                    href="/settings"
                    icon={HelpCircle}
                    label="Show me around"
                    description="Replay any feature tour"
                    onSelect={() => setMenuOpen(false)}
                  />
                  <SheetClose asChild>
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="text-status-error hover:bg-status-error-soft hover:text-status-error-fg group flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors disabled:opacity-60"
                      aria-busy={loggingOut ? "true" : "false"}
                    >
                      <span className="bg-status-error-soft text-status-error-fg ring-status-error/30 flex size-10 shrink-0 items-center justify-center rounded-xl ring-1">
                        {loggingOut ? (
                          <Loader2
                            className="h-4 w-4 animate-spin"
                            aria-hidden
                          />
                        ) : (
                          <LogOut className="h-4 w-4" aria-hidden />
                        )}
                      </span>
                      <span className="flex-1">
                        <span className="text-display block text-sm font-semibold tracking-tight">
                          {loggingOut ? "Signing out..." : "Log out"}
                        </span>
                        <span className="text-muted-foreground block text-xs">
                          End your session on this device
                        </span>
                      </span>
                    </button>
                  </SheetClose>
                </nav>
              </SheetContent>
            </Sheet>
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

interface MenuRowProps {
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  description: string;
  onSelect: () => void;
}

function MenuRow({
  href,
  icon: Icon,
  label,
  description,
  onSelect,
}: MenuRowProps) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className="group hover:bg-card focus-visible:bg-card flex items-center gap-3 rounded-xl px-3 py-3 transition-colors focus-visible:outline-none"
    >
      <span className="bg-secondary text-foreground ring-border group-hover:bg-foreground group-hover:text-background flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-colors">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-display block text-sm font-semibold tracking-tight">
          {label}
        </span>
        <span className="text-muted-foreground block truncate text-xs">
          {description}
        </span>
      </span>
    </Link>
  );
}

function Pip({ count }: { count: number }) {
  return (
    <span className="bg-copper text-foreground ring-background absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold ring-2">
      {count > 99 ? "99+" : count}
    </span>
  );
}
