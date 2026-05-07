"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Info,
  Loader2,
  Lock,
  LogOut,
  ShieldCheck,
  ShieldOff,
  User,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useLogout, useSignOutAllDevices } from "@/lib/hooks/use-logout";
import { APP_VERSION } from "@/lib/config";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface Tile {
  href: string;
  icon: LucideIcon;
  label: string;
  description: string;
  designerOnly?: boolean;
}

const TILES: Tile[] = [
  {
    href: "/profile/edit",
    icon: User,
    label: "Account",
    description: "Name, photo, location",
  },
  {
    href: "/notifications/preferences",
    icon: Bell,
    label: "Notifications",
    description: "Email, SMS, and push preferences",
  },
  {
    href: "/wallet",
    icon: Wallet,
    label: "Wallet",
    description: "Payout accounts and transactions",
    designerOnly: true,
  },
  {
    href: "/privacy",
    icon: ShieldCheck,
    label: "Privacy",
    description: "How we handle your data",
  },
  {
    href: "/#contact",
    icon: Info,
    label: "Help & support",
    description: "Contact us or browse FAQs",
  },
  {
    href: "/#about",
    icon: Info,
    label: "About Nidlo",
    description: "What we're building and why",
  },
];

interface ComingSoonTile {
  icon: LucideIcon;
  label: string;
  description: string;
}

const COMING_SOON: ComingSoonTile[] = [
  {
    icon: Lock,
    label: "Change phone number",
    description: "Re-verify with a new phone via OTP",
  },
  {
    icon: Lock,
    label: "Delete account",
    description: "Permanently remove your data after a 30-day cool-off",
  },
];

export default function SettingsPage() {
  const { user, isReady } = useAuthGuard({ requireOnboarded: true });
  const { logout, loading: loggingOut } = useLogout();
  const { signOutAll, loading: signingOutAll } = useSignOutAllDevices();
  const [confirmAllOpen, setConfirmAllOpen] = useState(false);

  if (!isReady || !user) {
    return (
      <AppShell>
        <div className="mx-auto max-w-lg space-y-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  const tiles = TILES.filter((t) => !t.designerOnly || user.isDesigner);

  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-7">
        <div>
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to profile
          </Link>
          <header className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
              Account
            </p>
            <h1 className="text-display mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Settings
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Manage your preferences, privacy, and account access.
            </p>
          </header>
        </div>

        {/* Available tiles */}
        <GlassCard variant="solid" className="divide-y divide-border/60 p-2">
          {tiles.map((tile) => (
            <SettingsTile key={`${tile.href}-${tile.label}`} tile={tile} />
          ))}
        </GlassCard>

        {/* Coming soon */}
        <section>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Coming soon
          </p>
          <GlassCard
            variant="solid"
            className="divide-y divide-border/60 p-2 opacity-70"
          >
            {COMING_SOON.map((tile) => {
              const Icon = tile.icon;
              return (
                <div
                  key={tile.label}
                  className="flex items-center gap-3 px-3 py-3"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground ring-1 ring-border">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-display text-sm font-semibold tracking-tight">
                      {tile.label}
                      <span className="rounded-full border border-copper/40 bg-copper/10 px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wider text-copper-soft">
                        Soon
                      </span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {tile.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </GlassCard>
        </section>

        {/* Sign-out actions */}
        <div className="space-y-2">
          <Button
            variant="luxe-outline"
            size="lg"
            className="w-full gap-1.5"
            onClick={logout}
            disabled={loggingOut || signingOutAll}
          >
            {loggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <LogOut className="h-4 w-4" aria-hidden />
            )}
            {loggingOut ? "Logging out…" : "Log out"}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="w-full gap-1.5 text-status-error hover:bg-status-error-soft hover:text-status-error-fg"
            onClick={() => setConfirmAllOpen(true)}
            disabled={loggingOut || signingOutAll}
          >
            <ShieldOff className="h-4 w-4" aria-hidden />
            Sign out of all devices
          </Button>
        </div>

        <p className="pt-2 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Nidlo · v{APP_VERSION}
        </p>
      </div>

      <Dialog open={confirmAllOpen} onOpenChange={setConfirmAllOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-display text-2xl font-semibold tracking-tight">
              Sign out of all devices?
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              This signs you out of every browser and tab where you&rsquo;re
              currently logged in — phone, laptop, tablet, anywhere.
              You&rsquo;ll need to log in again on each device.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setConfirmAllOpen(false)}
              disabled={signingOutAll}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="gap-1.5"
              onClick={async () => {
                setConfirmAllOpen(false);
                await signOutAll();
              }}
              disabled={signingOutAll}
            >
              {signingOutAll && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              )}
              <ShieldOff className="h-4 w-4" aria-hidden />
              Sign out everywhere
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function SettingsTile({ tile }: { tile: Tile }) {
  const Icon = tile.icon;
  return (
    <Link
      href={tile.href}
      className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors duration-200 hover:bg-card focus-visible:bg-card focus-visible:outline-none"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground ring-1 ring-border transition-colors group-hover:bg-foreground group-hover:text-background">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-display text-sm font-semibold tracking-tight">
          {tile.label}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {tile.description}
        </p>
      </div>
      <ChevronRight
        className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-copper"
        aria-hidden
      />
    </Link>
  );
}
