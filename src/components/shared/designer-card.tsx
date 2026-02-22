"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { DesignerCard as DesignerCardType } from "@/types/graphql";

interface Props {
  designer: DesignerCardType;
}

function formatPrice(pesewas: number): string {
  const ghs = pesewas / 100;
  return `GHS ${ghs.toLocaleString()}`;
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

  return (
    <Link href={`/designer/${designer.slug}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar className="h-14 w-14">
              <AvatarImage
                src={designer.avatarUrl ?? undefined}
                alt={designer.displayName ?? designer.fullName ?? "Designer"}
              />
              <AvatarFallback>{getInitials(designer.displayName ?? designer.fullName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="truncate font-semibold">
                  {designer.displayName ?? designer.fullName ?? "Designer"}
                </h3>
                {!designer.isAcceptingOrders && (
                  <Badge variant="secondary" className="ml-2 shrink-0 text-xs">
                    Unavailable
                  </Badge>
                )}
              </div>
              {designer.city && (
                <p className="text-sm text-muted-foreground">
                  {designer.city}
                  {designer.distance != null && (
                    <span> &middot; {designer.distance.toFixed(1)} km</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {specs.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {specs.slice(0, 3).map((s: string) => (
                <Badge key={s} variant="outline" className="text-xs">
                  {s.replace(/-/g, " ")}
                </Badge>
              ))}
              {specs.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{specs.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">&#9733;</span>
              <span className="font-medium">
                {designer.ratingAvg.toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                ({designer.totalReviews})
              </span>
            </div>
            {designer.pricingMin != null && designer.pricingMax != null && (
              <span className="text-muted-foreground">
                {formatPrice(designer.pricingMin)} -{" "}
                {formatPrice(designer.pricingMax)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
