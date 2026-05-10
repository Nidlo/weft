"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  Package,
  Star,
} from "lucide-react";

import { TRACK_PROFILE_VIEW } from "@/lib/graphql/mutations/profile";
import { AppShell } from "@/components/layout/app-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ThreadDivider } from "@/components/ui/thread-divider";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ReviewsSection } from "@/components/reviews/reviews-section";
import { ShareButtons } from "@/components/shared/share-buttons";
import { parseStringList } from "@/lib/utils/parse-list";
import { formatPesewasShort } from "@/lib/utils/order";
import { cn } from "@/lib/utils";
import type { GqlUserWithProfile, PortfolioImage } from "@/types/graphql";

interface Props {
  designer: GqlUserWithProfile;
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

function parseImages(raw: unknown): PortfolioImage[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as PortfolioImage[];
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  return [];
}

export function DesignerProfileView({ designer }: Props) {
  const router = useRouter();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const profile = designer.designerProfile;
  const images = parseImages(profile?.portfolioImages);
  const specs = parseStringList(profile?.specializations);
  const displayName = profile?.displayName ?? designer.fullName ?? "Designer";

  // Fire-and-forget profile view tracking. Silent-swallow is intentional:
  // a failed view-count increment must not surface as an error to the
  // viewer (the page renders fine without it). Logged at debug so a
  // sudden flood of failures still shows up in the console / Sentry
  // breadcrumb stream during incident triage. (Q-02)
  const [trackView] = useMutation(TRACK_PROFILE_VIEW);
  const tracked = useRef(false);
  useEffect(() => {
    if (profile?.slug && !tracked.current) {
      tracked.current = true;
      trackView({ variables: { slug: profile.slug } }).catch((err) => {
        if (process.env.NODE_ENV !== "production") {
          console.debug("[trackView] swallowed failure:", err);
        }
      });
    }
  }, [profile?.slug, trackView]);

  return (
    <AppShell bare>
      {/* Editorial hero band — bg-thread-mesh ties it visually to the home + auth */}
      <section className="bg-thread-mesh relative overflow-hidden">
        <div
          className="via-copper/40 pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent"
          aria-hidden
        />
        <div className="mx-auto max-w-5xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16 sm:pb-12">
          <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
            Nidlo · Designer
          </p>

          <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-8">
            <Avatar className="ring-background size-24 shrink-0 ring-2 sm:size-28">
              <AvatarImage
                src={designer.avatarUrl ?? undefined}
                alt={displayName}
              />
              <AvatarFallback className="bg-secondary text-2xl font-semibold">
                {getInitials(profile?.displayName ?? designer.fullName)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-display text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl">
                  {displayName}
                </h1>
                {designer.isVerified && (
                  <span className="bg-foreground text-background inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wider uppercase">
                    <CheckCircle2 className="h-3 w-3" aria-hidden />
                    Verified
                  </span>
                )}
                {profile?.isAcceptingOrders === false && (
                  <Badge
                    variant="outline"
                    className="border-border bg-background/60 rounded-full text-[11px] tracking-wider uppercase"
                  >
                    Not accepting orders
                  </Badge>
                )}
              </div>

              {designer.city && (
                <p className="text-muted-foreground mt-2 flex items-center gap-1.5 text-sm">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  <span>{designer.city}</span>
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <span className="flex items-center gap-1.5">
                  <Star
                    className="fill-copper text-copper h-4 w-4"
                    aria-hidden
                  />
                  <span className="text-display text-base font-semibold tabular-nums">
                    {(profile?.ratingAvg ?? 0).toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    ({profile?.totalReviews ?? 0} reviews)
                  </span>
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Package className="h-4 w-4" aria-hidden />
                  <span className="text-foreground font-medium tabular-nums">
                    {profile?.ordersCompleted ?? 0}
                  </span>{" "}
                  orders completed
                </span>
              </div>
            </div>
          </div>

          {/* Action panel — glass surface, sits below the hero */}
          <GlassCard
            variant="solid"
            className="mt-8 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4"
          >
            <Button
              variant="luxe"
              size="lg"
              className="flex-1 gap-1.5"
              disabled={!profile?.isAcceptingOrders}
              onClick={() =>
                router.push(`/blueprint?designer=${profile?.slug ?? ""}`)
              }
            >
              {profile?.isAcceptingOrders
                ? "Request a quote"
                : "Not accepting orders"}
              {profile?.isAcceptingOrders && (
                <ArrowRight className="h-4 w-4" aria-hidden />
              )}
            </Button>
            <Button
              type="button"
              variant="luxe-outline"
              size="lg"
              className="gap-1.5 sm:w-44"
            >
              <MessageSquare className="h-4 w-4" aria-hidden />
              Message
            </Button>
            <ShareButtons
              url={`${typeof window !== "undefined" ? window.location.origin : ""}/designer/${profile?.slug ?? ""}`}
              title={displayName}
              specializations={specs}
            />
          </GlassCard>
        </div>
      </section>

      {/* Body — editorial-spaced sections */}
      <div className="mx-auto max-w-5xl space-y-12 px-4 pt-12 pb-16 sm:px-6">
        {profile?.bio && (
          <SectionBlock eyebrow="About" title={`Meet ${displayName}.`}>
            <p className="text-foreground/85 text-base leading-relaxed text-pretty whitespace-pre-line">
              {profile.bio}
            </p>
          </SectionBlock>
        )}

        {specs.length > 0 && (
          <SectionBlock eyebrow="Craft" title="What they specialize in">
            <div className="flex flex-wrap gap-2">
              {specs.map((s) => (
                <span
                  key={s}
                  className="border-border bg-card inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium capitalize"
                >
                  <span className="bg-copper size-1 rounded-full" aria-hidden />
                  {s.replace(/-/g, " ")}
                </span>
              ))}
            </div>
          </SectionBlock>
        )}

        {profile?.pricingMin != null && profile?.pricingMax != null && (
          <SectionBlock eyebrow="Pricing" title="Typical price range">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:gap-6">
              <span className="text-display text-4xl font-semibold tabular-nums sm:text-5xl">
                {formatPesewasShort(profile.pricingMin)}
                <span className="text-muted-foreground/50 mx-3">–</span>
                {formatPesewasShort(profile.pricingMax)}
              </span>
              <p className="text-muted-foreground text-sm">
                Final price varies by design complexity and materials.
              </p>
            </div>
          </SectionBlock>
        )}

        <SectionBlock eyebrow="Performance" title="Track record">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <PerformanceStat
              icon={Package}
              value={`${profile?.ordersCompleted ?? 0}`}
              label="Orders"
            />
            <PerformanceStat
              icon={CheckCircle2}
              value={`${((profile?.onTimeRate ?? 0) as number).toFixed(0)}%`}
              label="On time"
            />
            <PerformanceStat
              icon={Clock}
              value={
                profile?.responseTimeAvg
                  ? `${Math.round(profile.responseTimeAvg / 60)}h`
                  : "—"
              }
              label="Avg response"
            />
          </div>
        </SectionBlock>

        {images.length > 0 && (
          <SectionBlock eyebrow="Portfolio" title="Recent work">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  aria-label={img.caption || `View portfolio image ${i + 1}`}
                  className={cn(
                    "group bg-muted ring-border relative aspect-square overflow-hidden rounded-2xl ring-1",
                    "hover:ring-copper/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-(--shadow-glow)"
                  )}
                >
                  <Image
                    src={img.thumbnail_url || img.url}
                    alt={img.caption || `Portfolio image ${i + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {img.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/40 to-transparent p-3">
                      <p className="truncate text-xs font-medium text-white">
                        {img.caption}
                      </p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </SectionBlock>
        )}

        <ThreadDivider tone="copper" label="Reviews" />

        <ReviewsSection
          designerId={designer.id}
          averageRating={profile?.ratingAvg ?? 0}
          totalReviews={profile?.totalReviews ?? 0}
        />
      </div>

      {/* Lightbox — preserves keyboard cycle, premium chrome */}
      <Dialog
        open={lightboxIndex !== null}
        onOpenChange={() => setLightboxIndex(null)}
      >
        <DialogContent className="max-w-4xl overflow-hidden p-0">
          {lightboxIndex !== null && images[lightboxIndex] && (
            <div className="bg-card">
              <Image
                src={images[lightboxIndex].url}
                alt={
                  images[lightboxIndex].caption ||
                  `Portfolio image ${lightboxIndex + 1}`
                }
                width={1200}
                height={1200}
                sizes="(max-width: 768px) 100vw, 768px"
                className="h-auto w-full"
              />
              {images[lightboxIndex].caption && (
                <p className="border-border/60 text-foreground/80 border-t px-5 pt-4 text-sm">
                  {images[lightboxIndex].caption}
                </p>
              )}
              <div className="border-border/60 flex items-center justify-between gap-3 border-t p-4">
                <Button
                  type="button"
                  variant="luxe-outline"
                  size="sm"
                  onClick={() =>
                    setLightboxIndex(
                      lightboxIndex > 0 ? lightboxIndex - 1 : images.length - 1
                    )
                  }
                  aria-label="Previous portfolio image"
                  className="gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                  Previous
                </Button>
                <span className="text-muted-foreground text-xs font-medium tabular-nums">
                  <span className="text-foreground">{lightboxIndex + 1}</span> /{" "}
                  {images.length}
                </span>
                <Button
                  type="button"
                  variant="luxe-outline"
                  size="sm"
                  onClick={() =>
                    setLightboxIndex(
                      lightboxIndex < images.length - 1 ? lightboxIndex + 1 : 0
                    )
                  }
                  aria-label="Next portfolio image"
                  className="gap-1"
                >
                  Next
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

interface SectionBlockProps {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}

function SectionBlock({ eyebrow, title, children }: SectionBlockProps) {
  return (
    <section>
      <header className="mb-5">
        <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
          {eyebrow}
        </p>
        <h2 className="text-display mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

interface PerformanceStatProps {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  value: string;
  label: string;
}

function PerformanceStat({ icon: Icon, value, label }: PerformanceStatProps) {
  return (
    <GlassCard variant="solid" className="p-5 text-center sm:p-6">
      <Icon className="text-copper mx-auto h-5 w-5" aria-hidden />
      <p className="text-display mt-3 text-3xl font-semibold tabular-nums sm:text-4xl">
        {value}
      </p>
      <p className="text-muted-foreground mt-1 text-[11px] font-semibold tracking-[0.16em] uppercase">
        {label}
      </p>
    </GlassCard>
  );
}
