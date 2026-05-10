"use client";

import Link from "next/link";
import { Calendar, Flame, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { PaymentStatusBadge } from "@/components/payment/payment-status-badge";
import {
  formatPesewas,
  getDaysUntilDeadline,
  getDeadlineColor,
  getStatusConfig,
} from "@/lib/utils/order";
import { cn } from "@/lib/utils";
import type { GqlOrder, GqlUser } from "@/types/graphql";

interface OrderCardProps {
  order: GqlOrder & { client?: GqlUser; designer?: GqlUser };
  viewAs: "client" | "designer";
}

export function OrderCard({ order, viewAs }: OrderCardProps) {
  const statusConfig = getStatusConfig(order.status);
  const otherParty = viewAs === "client" ? order.designer : order.client;
  const garmentType = order.blueprint?.garment_type ?? "Garment";
  const price = order.confirmedPrice ?? order.counterPrice ?? order.budgetMax;

  // For internal orders with no linked client, show clientName or fallback
  const otherPartyName =
    viewAs === "designer" && !otherParty
      ? (order.clientDisplayName ?? order.clientName ?? "Walk-in client")
      : (otherParty?.fullName ?? "Unknown");
  const otherPartyInitial = (otherPartyName ?? "?").charAt(0).toUpperCase();

  return (
    <Link
      href={`/orders/${order.id}`}
      className="group focus-visible:ring-ring focus-visible:ring-offset-background block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      <GlassCard
        variant="solid"
        interactive
        glow="copper"
        className="flex items-center gap-4 p-4 sm:p-5"
      >
        <Avatar className="ring-border size-11 shrink-0 ring-1">
          <AvatarFallback className="bg-secondary text-sm font-medium">
            {otherPartyInitial}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-display truncate text-sm font-semibold tracking-tight capitalize">
              {garmentType.replace(/_/g, " ")}
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase",
                statusConfig.bgColor,
                statusConfig.color
              )}
            >
              {statusConfig.label}
            </span>
            {order.isInternal && (
              <Badge
                variant="outline"
                className="border-border bg-card/60 rounded-full text-[10px] font-medium tracking-wider uppercase"
              >
                Internal
              </Badge>
            )}
            <PaymentStatusBadge summary={order.paymentSummary ?? null} />
          </div>

          <p className="text-muted-foreground flex items-center gap-1 truncate text-xs">
            <User className="h-3 w-3 shrink-0" aria-hidden />
            <span className="truncate">
              <span className="text-muted-foreground/70">
                {viewAs === "client" ? "Designer" : "Client"}
              </span>{" "}
              ·{" "}
              <span className="text-foreground font-medium">
                {otherPartyName}
              </span>
            </span>
          </p>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-foreground font-semibold tabular-nums">
              {formatPesewas(price)}
            </span>
            <span className="text-muted-foreground/40" aria-hidden>
              ·
            </span>
            <span
              className={cn(
                "flex items-center gap-1 font-medium",
                getDeadlineColor(order.deadline)
              )}
            >
              <Calendar className="h-3 w-3" aria-hidden />
              {getDaysUntilDeadline(order.deadline)}
            </span>
            {order.isRush && (
              <span className="text-copper flex items-center gap-1 font-semibold">
                <Flame className="h-3 w-3" aria-hidden />
                Rush
              </span>
            )}
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
