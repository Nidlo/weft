"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { DesignerCard } from "@/types/graphql";

interface Props {
  title: string;
  designers: DesignerCard[];
  loading: boolean;
  browseHref?: string;
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

export function DesignerScrollSection({
  title,
  designers,
  loading,
  browseHref,
}: Props) {
  if (!loading && designers.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {browseHref && (
          <Link
            href={browseHref}
            className="text-sm text-primary hover:underline"
          >
            See all
          </Link>
        )}
      </div>

      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-3">
          {loading &&
            designers.length === 0 &&
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="w-[200px] shrink-0">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                  </div>
                  <Skeleton className="mt-3 h-3 w-full" />
                  <Skeleton className="mt-1.5 h-3 w-2/3" />
                </CardContent>
              </Card>
            ))}

          {designers.map((designer) => (
            <MiniDesignerCard key={designer.id} designer={designer} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}

function MiniDesignerCard({ designer }: { designer: DesignerCard }) {
  const specs = Array.isArray(designer.specializations)
    ? designer.specializations
    : [];

  return (
    <Link href={`/designer/${designer.slug}`}>
      <Card className="w-[200px] shrink-0 transition-shadow hover:shadow-md">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={designer.avatarUrl ?? undefined}
                alt={designer.displayName ?? designer.fullName ?? "Designer"}
              />
              <AvatarFallback className="text-xs">
                {getInitials(designer.displayName ?? designer.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {designer.displayName ?? designer.fullName ?? "Designer"}
              </p>
              {designer.city && (
                <p className="truncate text-xs text-muted-foreground">
                  {designer.city}
                  {designer.distance != null && (
                    <span> &middot; {designer.distance.toFixed(1)} km</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {specs.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {specs.slice(0, 2).map((s: string) => (
                <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0">
                  {s.replace(/-/g, " ")}
                </Badge>
              ))}
              {specs.length > 2 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  +{specs.length - 2}
                </Badge>
              )}
            </div>
          )}

          <div className="mt-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-0.5">
              <span className="text-yellow-500">&#9733;</span>
              <span className="font-medium">
                {designer.ratingAvg.toFixed(1)}
              </span>
            </div>
            {designer.pricingMin != null && designer.pricingMax != null && (
              <span className="text-muted-foreground">
                {formatPrice(designer.pricingMin)}+
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
