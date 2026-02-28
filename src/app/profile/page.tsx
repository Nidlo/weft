"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useAuthStore } from "@/lib/stores/auth";
import { LOGOUT } from "@/lib/graphql/mutations/auth";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  MapPin,
  Phone,
  Mail,
  LogOut,
  Ruler,
  Scissors,
  ChevronRight,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isReady } = useAuthGuard({ requireOnboarded: true });
  const clearAuth = useAuthStore((s) => s.logout);
  const router = useRouter();
  const [logoutMutation] = useMutation(LOGOUT);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutMutation();
    } catch {
      // Even if backend call fails, clear local state
    }
    clearAuth();
    toast.success("Logged out");
    router.push("/");
  };

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

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your account and settings
          </p>
        </div>

        {/* Profile card */}
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName || "Profile"}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">
                {user.fullName || "No name set"}
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant={user.isDesigner ? "default" : "secondary"}>
                  {user.isDesigner ? "Designer" : "Client"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{user.phone}</span>
            </div>
            {user.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
            )}
            {user.city && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{user.city}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Link
              href="/measurements"
              className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-accent"
            >
              <div className="flex items-center gap-3">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">My Measurements (Body Vault)</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            {user.isDesigner && (
              <Link
                href="/dashboard"
                className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <Scissors className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Designer Dashboard</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            )}

            <Link
              href="/orders"
              className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-accent"
            >
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">My Orders</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            {user.isDesigner && (
              <Link
                href="/wallet"
                className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Wallet & Payouts</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {loggingOut ? "Logging out..." : "Log Out"}
        </Button>
      </div>
    </AppShell>
  );
}
