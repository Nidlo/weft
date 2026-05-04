"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Loader2,
  Lock,
  LogOut,
  ShieldCheck,
  ShieldOff,
  User,
  Wallet,
  Info,
} from "lucide-react";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useLogout, useSignOutAllDevices } from "@/lib/hooks/use-logout";
import { APP_VERSION } from "@/lib/config";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
  icon: typeof User;
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
    href: "/contact",
    icon: ShieldCheck,
    label: "Privacy",
    description: "How we handle your data",
  },
  {
    href: "/contact",
    icon: Info,
    label: "Help & Support",
    description: "Contact us or browse FAQs",
  },
  {
    href: "/about",
    icon: Info,
    label: "About",
    description: "Terms, privacy, and what Nidlo is",
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
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    );
  }

  const tiles = TILES.filter((t) => !t.designerOnly || user.isDesigner);

  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/profile" aria-label="Back to profile">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <div className="space-y-2">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link key={`${tile.href}-${tile.label}`} href={tile.href}>
                <Card className="transition-colors hover:border-primary/50 hover:bg-accent/30">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{tile.label}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {tile.description}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Phase 2 placeholders */}
        <div className="space-y-2 opacity-60">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Coming soon
          </p>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Change phone number</p>
                <p className="truncate text-xs text-muted-foreground">
                  Re-verify with a new phone via OTP
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Delete account</p>
                <p className="truncate text-xs text-muted-foreground">
                  Permanently remove your data after a 30-day cool-off
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={logout}
            disabled={loggingOut || signingOutAll}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {loggingOut ? "Logging out..." : "Log out"}
          </Button>

          <Button
            variant="ghost"
            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setConfirmAllOpen(true)}
            disabled={loggingOut || signingOutAll}
          >
            <ShieldOff className="mr-2 h-4 w-4" />
            Sign out of all devices
          </Button>
        </div>

        <p className="pt-2 text-center text-xs text-muted-foreground">
          Nidlo · v{APP_VERSION}
        </p>
      </div>

      <Dialog open={confirmAllOpen} onOpenChange={setConfirmAllOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out of all devices?</DialogTitle>
            <DialogDescription>
              This signs you out of every browser and tab where you&apos;re
              currently logged in — phone, laptop, tablet, anywhere. You&apos;ll
              need to log in again on each device.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmAllOpen(false)}
              disabled={signingOutAll}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                setConfirmAllOpen(false);
                await signOutAll();
              }}
              disabled={signingOutAll}
            >
              {signingOutAll && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign out everywhere
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
