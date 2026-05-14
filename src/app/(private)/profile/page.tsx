"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Coins,
  ExternalLink,
  LifeBuoy,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Ruler,
  Scissors,
  Settings,
  ShieldOff,
  User,
  type LucideIcon,
} from "lucide-react";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useLogout, useSignOutAllDevices } from "@/lib/hooks/use-logout";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GlassCard } from "@/components/ui/glass-card";
import { StyleProfileCard } from "@/components/profile/style-profile-card";
import { ReplayMenu } from "@/lib/tour/replay-menu";
import { cn } from "@/lib/utils";

interface QuickLink {
  href: string;
  icon: LucideIcon;
  label: string;
  description: string;
  designerOnly?: boolean;
}

const QUICK_LINKS: QuickLink[] = [
  {
    href: "/profile/edit",
    icon: Pencil,
    label: "Edit profile",
    description: "Name, contact, location, shop details",
  },
  {
    href: "/measurements",
    icon: Ruler,
    label: "Body Vault",
    description: "Saved measurements + Fitscan AI",
  },
  {
    href: "/earnings",
    icon: Coins,
    label: "Earnings",
    description: "Order history, transactions, and payout accounts",
    designerOnly: true,
  },
  {
    href: "/#contact",
    icon: LifeBuoy,
    label: "Help & support",
    description: "Get help with an order or your account",
  },
  {
    href: "/settings",
    icon: Settings,
    label: "Settings",
    description: "Notifications, privacy, delete account",
  },
];

export default function ProfilePage() {
  const { user, isReady } = useAuthGuard({ requireOnboarded: true });
  const { logout: handleLogout, loading: loggingOut } = useLogout();
  const { signOutAll, loading: signingOutAll } = useSignOutAllDevices();
  const [confirmAllOpen, setConfirmAllOpen] = useState(false);

  if (!isReady || !user) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-5 w-72" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  const visibleLinks = QUICK_LINKS.filter(
    (l) => !l.designerOnly || user.isDesigner
  );

  return (
    <AppShell>
      <div className="space-y-7">
        <header>
          <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
            Account
          </p>
          <h1 className="text-display mt-2 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            My profile
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Manage your account, contact info, and notifications.
          </p>
        </header>

        {/* Profile hero */}
        <GlassCard
          variant="solid"
          className="bg-thread-mesh relative overflow-hidden p-6 sm:p-7"
        >
          <div
            className="via-copper/40 pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent"
            aria-hidden
          />
          <div className="flex items-center gap-4">
            <div className="bg-secondary ring-background flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 sm:size-24">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.fullName || "Profile"}
                  width={96}
                  height={96}
                  sizes="96px"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="text-muted-foreground h-10 w-10" aria-hidden />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-display truncate text-xl font-semibold tracking-tight sm:text-2xl">
                {user.fullName || "No name set"}
              </h2>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase",
                    user.isDesigner
                      ? "bg-copper/15 text-copper-soft ring-copper/30 ring-1"
                      : "bg-secondary text-foreground/80"
                  )}
                >
                  {user.isDesigner ? (
                    <>
                      <Scissors className="h-3 w-3" aria-hidden />
                      Designer
                    </>
                  ) : (
                    "Client"
                  )}
                </span>
              </div>
            </div>
            <Button
              variant="luxe-outline"
              size="icon"
              asChild
              className="shrink-0"
            >
              <Link href="/profile/edit" aria-label="Edit profile">
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </GlassCard>

        {/* Contact info */}
        <section>
          <header className="mb-4">
            <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
              Contact
            </p>
            <h2 className="text-display mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
              How to reach you
            </h2>
          </header>
          <GlassCard variant="solid" className="divide-border/60 divide-y p-2">
            <ContactRow icon={Phone} label="Phone" value={user.phone} />
            {user.email && (
              <ContactRow icon={Mail} label="Email" value={user.email} />
            )}
            {user.city && (
              <ContactRow icon={MapPin} label="City" value={user.city} />
            )}
          </GlassCard>
        </section>

        {/* Style profile (Anthropic Fitscan) */}
        <StyleProfileCard />

        {/* Designer: public profile shortcut */}
        {user.isDesigner && user.designerProfile?.slug && (
          <section>
            <header className="mb-4">
              <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
                Designer
              </p>
              <h2 className="text-display mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
                Your public profile
              </h2>
            </header>
            <GlassCard variant="solid" className="p-2">
              <Link
                href={`/designer/${user.designerProfile.slug}`}
                className="group hover:bg-card focus-visible:bg-card flex items-center gap-3 rounded-xl px-3 py-3 transition-colors duration-200 focus-visible:outline-none"
              >
                <span className="bg-secondary text-foreground ring-border group-hover:bg-foreground group-hover:text-background flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-colors">
                  <Scissors className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-display text-sm font-semibold tracking-tight">
                    View as client
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    See exactly what clients see on your profile
                  </p>
                </div>
                <ExternalLink
                  className="text-muted-foreground group-hover:text-copper h-4 w-4 shrink-0 transition-colors"
                  aria-hidden
                />
              </Link>
            </GlassCard>
          </section>
        )}

        {/* Quick links */}
        <section>
          <header className="mb-4">
            <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
              Shortcuts
            </p>
            <h2 className="text-display mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
              Quick links
            </h2>
          </header>
          <GlassCard variant="solid" className="divide-border/60 divide-y p-2">
            {visibleLinks.map((link) => (
              <QuickLinkRow key={link.href} link={link} />
            ))}
          </GlassCard>
        </section>

        {/* Show me around */}
        <section>
          <header className="mb-4">
            <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
              Show me around
            </p>
            <h2 className="text-display mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
              Replay a tour
            </h2>
          </header>
          <ReplayMenu />
        </section>

        {/* Sign-out actions */}
        <div className="space-y-2">
          <Button
            variant="luxe-outline"
            size="lg"
            className="text-status-error hover:bg-status-error-soft hover:text-status-error-fg w-full gap-1.5"
            onClick={handleLogout}
            disabled={loggingOut || signingOutAll}
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
      </div>

      <Dialog open={confirmAllOpen} onOpenChange={setConfirmAllOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-display text-2xl font-semibold tracking-tight">
              Sign out of all devices?
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              This signs you out of every browser and tab where you&apos;re
              currently logged in &mdash; phone, laptop, tablet, anywhere.
              You&apos;ll need to log in again on each device.
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

interface ContactRowProps {
  icon: LucideIcon;
  label: string;
  value: string | null | undefined;
}

function ContactRow({ icon: Icon, label, value }: ContactRowProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-3">
      <span className="bg-secondary text-foreground ring-border flex size-9 shrink-0 items-center justify-center rounded-xl ring-1">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
          {label}
        </p>
        <p className="truncate text-sm font-medium tabular-nums">{value}</p>
      </div>
    </div>
  );
}

function QuickLinkRow({ link }: { link: QuickLink }) {
  const Icon = link.icon;
  return (
    <Link
      href={link.href}
      className="group hover:bg-card focus-visible:bg-card flex items-center gap-3 rounded-xl px-3 py-3 transition-colors duration-200 focus-visible:outline-none"
    >
      <span className="bg-secondary text-foreground ring-border group-hover:bg-foreground group-hover:text-background flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-colors">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-display text-sm font-semibold tracking-tight">
          {link.label}
        </p>
        <p className="text-muted-foreground truncate text-xs">
          {link.description}
        </p>
      </div>
      <ChevronRight
        className="text-muted-foreground group-hover:text-copper h-4 w-4 shrink-0 transition-all group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}
