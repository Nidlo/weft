"use client";

import Link from "next/link";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Ruler,
  ClipboardList,
  Scissors,
  User,
  Star,
  TrendingUp,
  ArrowRight,
  Plus,
  Share2,
  Eye,
} from "lucide-react";
import { useOrders } from "@/lib/hooks/use-orders";
import { OrderCard } from "@/components/order/order-card";
import { ShareButtons } from "@/components/shared/share-buttons";
import { ACTIVE_STATUSES } from "@/lib/utils/order";
import type { User as AuthUser } from "@/lib/stores/auth";

function ClientDashboard({ firstName }: { firstName: string | null }) {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome{firstName ? `, ${firstName}` : ""}!
        </h1>
        <p className="text-muted-foreground">
          Find the perfect designer for your next outfit
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/search" className="group">
          <Card className="h-full transition-colors group-hover:border-primary">
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Find a Designer</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Browse talented tailors and seamstresses near you
                </p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/measurements" className="group">
          <Card className="h-full transition-colors group-hover:border-primary">
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <Ruler className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Body Vault</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Save your measurements for faster ordering
                </p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/orders" className="group">
          <Card className="h-full transition-colors group-hover:border-primary">
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">My Orders</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Track your garment orders and progress
                </p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/profile" className="group">
          <Card className="h-full transition-colors group-hover:border-primary">
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">My Profile</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage your account settings
                </p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                1
              </div>
              <p className="mt-2 text-sm font-medium">Find a designer</p>
              <p className="text-xs text-muted-foreground">
                Search by specialization, location, or price
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                2
              </div>
              <p className="mt-2 text-sm font-medium">Submit your blueprint</p>
              <p className="text-xs text-muted-foreground">
                Specify garment details, measurements, and budget
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                3
              </div>
              <p className="mt-2 text-sm font-medium">Track production</p>
              <p className="text-xs text-muted-foreground">
                Follow every step from cutting to delivery
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DesignerDashboard({ user }: { user: AuthUser }) {
  const firstName = user.firstName;
  const slug = user.designerProfile?.slug;
  const viewsThisWeek = user.designerProfile?.profileViewsThisWeek ?? 0;
  const viewsTotal = user.designerProfile?.profileViewsCount ?? 0;
  const profileUrl = slug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/designer/${slug}`
    : "";
  const { orders } = useOrders(undefined, 5);
  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const pendingOrders = orders.filter((o) => o.status === "pending");

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome{firstName ? `, ${firstName}` : ""}!
        </h1>
        <p className="text-muted-foreground">Your designer dashboard</p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Active Orders
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold">{activeOrders.length}</p>
            {pendingOrders.length > 0 && (
              <Badge variant="default" className="mt-1 text-xs">
                {pendingOrders.length} pending
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Rating</span>
            </div>
            <p className="mt-2 text-2xl font-bold">--</p>
            <p className="mt-1 text-xs text-muted-foreground">
              No reviews yet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Profile Views
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold">{viewsTotal}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {viewsThisWeek} this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profile completeness */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Complete your profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            A complete profile helps clients find and trust you. Update your bio,
            specializations, pricing, and portfolio.
          </p>
          <Progress value={0} className="h-2" />
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile">
              <Scissors className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Share Your Profile */}
      {slug && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Share2 className="h-4 w-4" />
              Share Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
              <Eye className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-sm font-mono">
                {profileUrl.replace(/^https?:\/\//, "")}
              </span>
            </div>
            {viewsThisWeek > 0 && (
              <p className="text-sm text-muted-foreground">
                Viewed {viewsThisWeek} time{viewsThisWeek !== 1 ? "s" : ""} this week
              </p>
            )}
            <ShareButtons
              url={profileUrl}
              title={user.fullName ?? "My Profile"}
            />
            <p className="text-xs text-muted-foreground">
              Share your profile to get more bookings
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recent orders */}
      {orders.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <Button variant="link" size="sm" asChild>
              <Link href="/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {orders.slice(0, 3).map((order) => (
              <OrderCard
                key={order.id}
                order={order as Parameters<typeof OrderCard>[0]["order"]}
                viewAs="designer"
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/orders/new" className="group">
          <Card className="h-full transition-colors group-hover:border-primary">
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Create Order</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add an order for a walk-in client
                </p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/orders" className="group">
          <Card className="h-full transition-colors group-hover:border-primary">
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">My Orders</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  View and manage incoming orders
                </p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/profile" className="group">
          <Card className="h-full transition-colors group-hover:border-primary">
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">My Profile</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Update your portfolio and settings
                </p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isReady } = useAuthGuard({ requireOnboarded: true });

  if (!isReady || !user) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-5 w-32" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {user.isDesigner ? (
        <DesignerDashboard user={user} />
      ) : (
        <ClientDashboard firstName={user.firstName} />
      )}
    </AppShell>
  );
}
