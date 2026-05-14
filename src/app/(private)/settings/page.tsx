"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Info,
  Lock,
  LogOut,
  ShieldCheck,
  ShieldOff,
  Trash2,
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
import { ReplayMenu } from "@/lib/tour/replay-menu";

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
  {
    href: "/settings/delete-account",
    icon: Trash2,
    label: "Delete account",
    description: "Deactivate now with a 30-day restore window",
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
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to profile
          </Link>
          <header className="mt-4">
            <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
              Account
            </p>
            <h1 className="text-display mt-2 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
              Settings
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Manage your preferences, privacy, and account access.
            </p>
          </header>
        </div>

        {/* Available tiles */}
        <GlassCard variant="solid" className="divide-border/60 divide-y p-2">
          {tiles.map((tile) => (
            <SettingsTile key={`${tile.href}-${tile.label}`} tile={tile} />
          ))}
        </GlassCard>

        {/* Show me around */}
        <section>
          <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-[0.18em] uppercase">
            Show me around
          </p>
          <ReplayMenu />
        </section>

        {/* Coming soon */}
        <section>
          <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-[0.18em] uppercase">
            Coming soon
          </p>
          <GlassCard
            variant="solid"
            className="divide-border/60 divide-y p-2 opacity-70"
          >
            {COMING_SOON.map((tile) => {
              const Icon = tile.icon;
              return (
                <div
                  key={tile.label}
                  className="flex items-center gap-3 px-3 py-3"
                >
                  <span className="bg-muted text-muted-foreground ring-border flex size-10 shrink-0 items-center justify-center rounded-xl ring-1">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-display flex items-center gap-2 text-sm font-semibold tracking-tight">
                      {tile.label}
                      <span className="border-copper/40 bg-copper/10 text-copper-soft rounded-full border px-1.5 py-0 text-[9px] font-semibold tracking-wider uppercase">
                        Soon
                      </span>
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
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
            disabled={signingOutAll}
            loading={loggingOut}
            loadingLabel="Logging out..."
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Log out
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="text-status-error hover:bg-status-error-soft hover:text-status-error-fg w-full gap-1.5"
            onClick={() => setConfirmAllOpen(true)}
            disabled={loggingOut || signingOutAll}
          >
            <ShieldOff className="h-4 w-4" aria-hidden />
            Sign out of all devices
          </Button>
        </div>

        <p className="text-muted-foreground pt-2 text-center text-[11px] font-semibold tracking-[0.16em] uppercase">
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
              This signs you out of every browser and tab where you&apos;re
              currently logged in — phone, laptop, tablet, anywhere. You&apos;ll
              need to log in again on each device.
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
              loading={signingOutAll}
              loadingLabel="Signing out everywhere..."
            >
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
      className="group hover:bg-card focus-visible:bg-card flex items-center gap-3 rounded-xl px-3 py-3 transition-colors duration-200 focus-visible:outline-none"
    >
      <span className="bg-secondary text-foreground ring-border group-hover:bg-foreground group-hover:text-background flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-colors">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-display text-sm font-semibold tracking-tight">
          {tile.label}
        </p>
        <p className="text-muted-foreground truncate text-xs">
          {tile.description}
        </p>
      </div>
      <ChevronRight
        className="text-muted-foreground group-hover:text-copper h-4 w-4 shrink-0 transition-all group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}
