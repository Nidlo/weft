"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList, Plus, Search } from "lucide-react";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useOrders } from "@/lib/hooks/use-orders";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { OrderCard } from "@/components/order/order-card";
import { ACTIVE_STATUSES } from "@/lib/utils/order";

type TabValue = "all" | "active" | "completed" | "cancelled";

const STATUS_FILTERS: Record<TabValue, string | undefined> = {
  all: undefined,
  active: undefined, // filtered client-side
  completed: "delivered",
  cancelled: "cancelled",
};

const TAB_LABELS: Record<TabValue, string> = {
  all: "All",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function OrdersPage() {
  const { user, isReady } = useAuthGuard({ requireOnboarded: true });
  const [tab, setTab] = useState<TabValue>("all");
  const [page, setPage] = useState(1);

  const { orders, paginatorInfo, loading, error } = useOrders(
    STATUS_FILTERS[tab],
    20,
    page
  );

  if (!isReady || !user) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-3 w-32" />
            <Skeleton className="mt-3 h-10 w-56" />
            <Skeleton className="mt-3 h-5 w-72" />
          </div>
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        </div>
      </AppShell>
    );
  }

  const viewAs = user.isDesigner ? "designer" : "client";

  // Client-side filter for "active" tab
  const filteredOrders =
    tab === "active"
      ? orders.filter((o) => ACTIVE_STATUSES.includes(o.status))
      : orders;

  return (
    <AppShell>
      <div className="space-y-7">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
              {user.isDesigner ? "Studio orders" : "Your orders"}
            </p>
            <h1 className="text-display mt-2 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
              My orders
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              {user.isDesigner
                ? "Manage incoming orders and track production from sketch to delivery."
                : "Track your garment orders and follow every stitch from cutting to delivery."}
            </p>
          </div>
          {user.isDesigner && (
            <Button
              variant="luxe"
              size="lg"
              asChild
              className="gap-1.5 sm:shrink-0"
            >
              <Link href="/orders/new">
                <Plus className="h-4 w-4" aria-hidden />
                New order
              </Link>
            </Button>
          )}
        </header>

        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v as TabValue);
            setPage(1);
          }}
        >
          <TabsList className="border-border bg-card w-full justify-start gap-1 rounded-full border p-1 sm:w-auto">
            {(Object.keys(TAB_LABELS) as TabValue[]).map((key) => (
              <TabsTrigger
                key={key}
                value={key}
                className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-full px-4 py-1.5 text-sm font-medium"
              >
                {TAB_LABELS[key]}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={tab} className="mt-6">
            {loading && filteredOrders.length === 0 ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                ))}
              </div>
            ) : error ? (
              <GlassCard variant="solid" className="py-12 text-center">
                <p className="text-status-error-fg text-sm font-medium">
                  Couldn&apos;t load your orders.
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Check your connection and try again.
                </p>
              </GlassCard>
            ) : filteredOrders.length === 0 ? (
              <GlassCard
                variant="solid"
                className="flex flex-col items-center py-16 text-center"
              >
                <span className="bg-secondary text-foreground flex size-16 items-center justify-center rounded-2xl">
                  <ClipboardList className="h-7 w-7" aria-hidden />
                </span>
                <h2 className="text-display mt-5 text-2xl font-semibold tracking-tight">
                  {tab === "all" && "No orders yet."}
                  {tab === "active" && "Nothing in flight."}
                  {tab === "completed" && "No completed orders yet."}
                  {tab === "cancelled" && "No cancelled orders."}
                </h2>
                <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm text-pretty">
                  {user.isDesigner
                    ? tab === "all"
                      ? "Once clients commission you, their orders will land here."
                      : "Nothing matching this filter — try a different tab."
                    : tab === "all"
                      ? "Browse designers and place an order — you'll be able to follow every step from here."
                      : "Nothing matching this filter — try a different tab."}
                </p>
                {!user.isDesigner && (tab === "all" || tab === "active") && (
                  <Button
                    variant="luxe"
                    size="lg"
                    className="mt-6 gap-1.5"
                    asChild
                  >
                    <Link href="/search">
                      <Search className="h-4 w-4" aria-hidden />
                      Browse designers
                    </Link>
                  </Button>
                )}
              </GlassCard>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order as Parameters<typeof OrderCard>[0]["order"]}
                    viewAs={viewAs}
                  />
                ))}

                {paginatorInfo?.hasMorePages && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="luxe-outline"
                      onClick={() => setPage((p) => p + 1)}
                      loading={loading}
                      loadingLabel="Loading..."
                    >
                      Load more
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
