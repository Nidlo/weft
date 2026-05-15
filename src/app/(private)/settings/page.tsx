"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Info,
  Lock,
  ShieldCheck,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
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
    href: "/notifications/preferences",
    icon: Bell,
    label: "Notifications",
    description: "Email, SMS, and push preferences",
  },
  {
    href: "/settings/privacy",
    icon: ShieldCheck,
    label: "Privacy",
    description: "Cookies, tracking, and how we handle your data",
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
];

export default function SettingsPage() {
  const { user, isReady } = useAuthGuard({ requireOnboarded: true });

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

        {/* Danger zone */}
        <section>
          <p className="text-status-error mb-3 text-[11px] font-semibold tracking-[0.18em] uppercase">
            Danger zone
          </p>
          <GlassCard variant="solid" className="border-status-error/20 p-2">
            <Link
              href="/settings/delete-account"
              className="group hover:bg-status-error-soft focus-visible:bg-status-error-soft flex items-center gap-3 rounded-xl px-3 py-3 transition-colors duration-200 focus-visible:outline-none"
            >
              <span className="bg-status-error-soft text-status-error-fg ring-status-error/30 flex size-10 shrink-0 items-center justify-center rounded-xl ring-1">
                <Trash2 className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-display text-sm font-semibold tracking-tight">
                  Delete account
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  Deactivate now with a 30-day restore window
                </p>
              </div>
              <ChevronRight
                className="text-muted-foreground group-hover:text-status-error h-4 w-4 shrink-0 transition-all group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </GlassCard>
        </section>
      </div>
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
