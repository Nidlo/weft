"use client";

import Link from "next/link";
import { Star, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatPesewasShort } from "@/lib/utils/order";
import { cn } from "@/lib/utils";
import type { DesignerCard as DesignerCardType } from "@/types/graphql";

interface Props {
  designer: DesignerCardType;
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function DesignerCard({ designer }: Props) {
  const specs = Array.isArray(designer.specializations)
    ? designer.specializations
    : typeof designer.specializations === "string"
      ? JSON.parse(designer.specializations as string)
      : [];

  const name = designer.displayName ?? designer.fullName ?? "Designer";

  return (
    <Link
      href={`/designer/${designer.slug}`}
      className="group focus-visible:ring-ring focus-visible:ring-offset-background block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      <GlassCard variant="solid" interactive glow="copper" className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="ring-border h-14 w-14 ring-1">
            <AvatarImage src={designer.avatarUrl ?? undefined} alt={name} />
            <AvatarFallback className="bg-secondary font-medium">
              {getInitials(designer.displayName ?? designer.fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-display truncate text-lg font-semibold tracking-tight">
                {name}
              </h3>
              {!designer.isAcceptingOrders && (
                <Badge
                  variant="secondary"
                  className="shrink-0 text-[10px] tracking-wider uppercase"
                >
                  Unavailable
                </Badge>
              )}
            </div>
            {designer.city && (
              <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-sm">
                <MapPin className="h-3 w-3" aria-hidden />
                <span className="truncate">
                  {designer.city}
                  {designer.distance != null && (
                    <span className="text-muted-foreground/70">
                      {" · "}
                      {designer.distance.toFixed(1)} km
                    </span>
                  )}
                </span>
              </p>
            )}
          </div>
        </div>

        {specs.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {specs.slice(0, 3).map((s: string) => (
              <Badge
                key={s}
                variant="outline"
                className="border-border bg-background/50 rounded-full text-[11px] font-medium capitalize"
              >
                {s.replace(/-/g, " ")}
              </Badge>
            ))}
            {specs.length > 3 && (
              <Badge
                variant="outline"
                className="border-border bg-background/50 rounded-full text-[11px] font-medium"
              >
                +{specs.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="border-border/60 mt-4 flex items-center justify-between border-t pt-3 text-sm">
          <div className="flex items-center gap-1.5">
            <Star
              className={cn(
                "fill-copper text-copper h-4 w-4 transition-transform duration-300",
                "group-hover:scale-110 group-hover:rotate-12"
              )}
              aria-hidden
            />
            <span className="font-semibold tabular-nums">
              {designer.ratingAvg.toFixed(1)}
            </span>
            <span className="text-muted-foreground">
              ({designer.totalReviews})
            </span>
          </div>
          {designer.pricingMin != null && designer.pricingMax != null && (
            <span className="text-foreground/80 font-medium tabular-nums">
              {formatPesewasShort(designer.pricingMin)} –{" "}
              {formatPesewasShort(designer.pricingMax)}
            </span>
          )}
        </div>
      </GlassCard>
    </Link>
  );
}
