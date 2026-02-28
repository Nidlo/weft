"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import type { GqlOrder, GqlUser } from "@/types/graphql";
import { PaymentStatusBadge } from "@/components/payment/payment-status-badge";
import {
  getStatusConfig,
  formatPesewas,
  getDeadlineColor,
  getDaysUntilDeadline,
} from "@/lib/utils/order";

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
      ? order.clientDisplayName ?? order.clientName ?? "Walk-in Client"
      : otherParty?.fullName ?? "Unknown";
  const otherPartyInitial = otherPartyName.charAt(0);

  return (
    <Link href={`/orders/${order.id}`}>
      <Card className="transition-colors hover:border-primary">
        <CardContent className="flex items-center gap-4 py-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="text-xs">
              {otherPartyInitial}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium capitalize">
                {garmentType.replace(/_/g, " ")}
              </span>
              <Badge
                variant="secondary"
                className={`${statusConfig.bgColor} ${statusConfig.color} shrink-0 border-0`}
              >
                {statusConfig.label}
              </Badge>
              {order.isInternal && (
                <Badge variant="outline" className="shrink-0 text-xs">
                  Internal
                </Badge>
              )}
              <PaymentStatusBadge summary={order.paymentSummary ?? null} />
            </div>

            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {viewAs === "client" ? "Designer" : "Client"}:{" "}
              {otherPartyName}
            </p>

            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {formatPesewas(price)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className={getDeadlineColor(order.deadline)}>
                  {getDaysUntilDeadline(order.deadline)}
                </span>
              </span>
              {order.isRush && (
                <span className="flex items-center gap-1 text-orange-600">
                  <Clock className="h-3 w-3" />
                  Rush
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
