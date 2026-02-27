"use client";

import { useState } from "react";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useOrders } from "@/lib/hooks/use-orders";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { OrderCard } from "@/components/order/order-card";
import { ClipboardList, Plus } from "lucide-react";
import { ACTIVE_STATUSES } from "@/lib/utils/order";
import Link from "next/link";

type TabValue = "all" | "active" | "completed" | "cancelled";

const STATUS_FILTERS: Record<TabValue, string | undefined> = {
  all: undefined,
  active: undefined, // filtered client-side
  completed: "delivered",
  cancelled: "cancelled",
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
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
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
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Orders</h1>
            <p className="text-muted-foreground">
              {user.isDesigner
                ? "Manage incoming orders and track production"
                : "Track your garment orders and their progress"}
            </p>
          </div>
          {user.isDesigner && (
            <Button asChild size="sm">
              <Link href="/orders/new">
                <Plus className="mr-1 h-4 w-4" />
                New Order
              </Link>
            </Button>
          )}
        </div>

        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v as TabValue);
            setPage(1);
          }}
        >
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4">
            {loading && filteredOrders.length === 0 ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <p className="text-sm text-destructive">
                  Failed to load orders. Please try again.
                </p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-12 text-center">
                <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">
                  {tab === "all"
                    ? "No orders yet. Browse designers to get started!"
                    : `No ${tab} orders.`}
                </p>
              </div>
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
                      variant="outline"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Load More"}
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
