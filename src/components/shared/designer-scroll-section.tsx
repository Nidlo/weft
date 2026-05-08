"use client";

import Link from "next/link";
import { ArrowUpRight, Star, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Section } from "@/components/ui/section";
import { formatPesewasShort } from "@/lib/utils/order";
import { cn } from "@/lib/utils";
import type { DesignerCard } from "@/types/graphql";

interface Props {
  title: string;
  designers: DesignerCard[];
  loading: boolean;
  browseHref?: string;
  /** Optional eyebrow above the title for editorial framing. */
  eyebrow?: string;
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
  eyebrow,
}: Props) {
  if (!loading && designers.length === 0) return null;

  return (
    <Section
      density="compact"
      eyebrow={eyebrow}
      title={title}
      action={
        browseHref && (
          <Link
            href={browseHref}
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            See all
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        )
      }
    >
      <ScrollArea className="-mx-4 w-screen sm:mx-0 sm:w-full">
        <div className="flex gap-4 px-4 pb-4 sm:px-0">
          {loading &&
            designers.length === 0 &&
            Array.from({ length: 5 }).map((_, i) => (
              <GlassCard
                key={i}
                variant="solid"
                className="w-55 shrink-0 p-4"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="mt-4 h-3 w-full" />
                <Skeleton className="mt-1.5 h-3 w-2/3" />
              </GlassCard>
            ))}

          {designers.map((designer) => (
            <MiniDesignerCard key={designer.id} designer={designer} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Section>
  );
}

function MiniDesignerCard({ designer }: { designer: DesignerCard }) {
  const specs = Array.isArray(designer.specializations)
    ? designer.specializations
    : [];
  const name = designer.displayName ?? designer.fullName ?? "Designer";

  return (
    <Link
      href={`/designer/${designer.slug}`}
      className="group block shrink-0 outline-none rounded-2xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <GlassCard
        variant="solid"
        interactive
        glow="copper"
        className="w-55 p-4"
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 ring-1 ring-border">
            <AvatarImage src={designer.avatarUrl ?? undefined} alt={name} />
            <AvatarFallback className="bg-secondary text-xs font-medium">
              {getInitials(designer.displayName ?? designer.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-tight">
              {name}
            </p>
            {designer.city && (
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
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
          <div className="mt-3 flex flex-wrap gap-1">
            {specs.slice(0, 2).map((s: string) => (
              <Badge
                key={s}
                variant="outline"
                className="rounded-full border-border bg-background/50 px-2 py-0 text-[10px] font-medium capitalize"
              >
                {s.replace(/-/g, " ")}
              </Badge>
            ))}
            {specs.length > 2 && (
              <Badge
                variant="outline"
                className="rounded-full border-border bg-background/50 px-2 py-0 text-[10px] font-medium"
              >
                +{specs.length - 2}
              </Badge>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-xs">
          <div className="flex items-center gap-1">
            <Star
              className={cn(
                "h-3.5 w-3.5 fill-copper text-copper transition-transform",
                "group-hover:rotate-12"
              )}
              aria-hidden
            />
            <span className="font-semibold tabular-nums">
              {designer.ratingAvg.toFixed(1)}
            </span>
          </div>
          {designer.pricingMin != null && designer.pricingMax != null && (
            <span className="text-muted-foreground tabular-nums">
              {formatPesewasShort(designer.pricingMin)}+
            </span>
          )}
        </div>
      </GlassCard>
    </Link>
  );
}
