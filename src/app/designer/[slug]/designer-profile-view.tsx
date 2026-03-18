"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { TRACK_PROFILE_VIEW } from "@/lib/graphql/mutations/profile";
import { AppShell } from "@/components/layout/app-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ReviewsSection } from "@/components/reviews/reviews-section";
import { ShareButtons } from "@/components/shared/share-buttons";
import type { GqlUserWithProfile, PortfolioImage } from "@/types/graphql";

interface Props {
  designer: GqlUserWithProfile;
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

function parseSpecs(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
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
  const specs = parseSpecs(profile?.specializations);

  // Fire-and-forget profile view tracking
  const [trackView] = useMutation(TRACK_PROFILE_VIEW);
  const tracked = useRef(false);
  useEffect(() => {
    if (profile?.slug && !tracked.current) {
      tracked.current = true;
      trackView({ variables: { slug: profile.slug } }).catch(() => {});
    }
  }, [profile?.slug, trackView]);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={designer.avatarUrl ?? undefined}
              alt={designer.designerProfile?.displayName ?? designer.fullName ?? "Designer"}
            />
            <AvatarFallback className="text-xl">
              {getInitials(designer.designerProfile?.displayName ?? designer.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">
                {designer.designerProfile?.displayName ?? designer.fullName ?? "Designer"}
              </h1>
              {designer.isVerified && (
                <Badge variant="default" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
            {designer.city && (
              <p className="text-muted-foreground">{designer.city}</p>
            )}
            <div className="mt-2 flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <span className="text-yellow-500">&#9733;</span>
                <span className="font-medium">
                  {(profile?.ratingAvg ?? 0).toFixed(1)}
                </span>
                <span className="text-muted-foreground">
                  ({profile?.totalReviews ?? 0} reviews)
                </span>
              </span>
              <span className="text-muted-foreground">
                {profile?.ordersCompleted ?? 0} orders
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            className="flex-1"
            disabled={!profile?.isAcceptingOrders}
            onClick={() =>
              router.push(`/blueprint?designer=${profile?.slug ?? ""}`)
            }
          >
            {profile?.isAcceptingOrders
              ? "Request Quote"
              : "Not Accepting Orders"}
          </Button>
          <Button type="button" variant="outline">
            Message
          </Button>
        </div>

        {/* Share */}
        <ShareButtons
          url={`${typeof window !== "undefined" ? window.location.origin : ""}/designer/${profile?.slug ?? ""}`}
          title={profile?.displayName ?? designer.fullName ?? "Designer"}
          specializations={specs}
        />

        {/* Bio */}
        {profile?.bio && (
          <Card>
            <CardContent className="p-4">
              <h2 className="mb-2 font-semibold">About</h2>
              <p className="whitespace-pre-line text-sm text-muted-foreground">
                {profile.bio}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Specializations */}
        {specs.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h2 className="mb-3 font-semibold">Specializations</h2>
              <div className="flex flex-wrap gap-2">
                {specs.map((s) => (
                  <Badge key={s} variant="outline">
                    {s.replace(/-/g, " ")}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing */}
        {profile?.pricingMin != null && profile?.pricingMax != null && (
          <Card>
            <CardContent className="p-4">
              <h2 className="mb-2 font-semibold">Pricing</h2>
              <p className="text-lg font-medium">
                {formatPrice(profile.pricingMin)} -{" "}
                {formatPrice(profile.pricingMax)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Final price varies by design complexity and materials
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <Card>
          <CardContent className="p-4">
            <h2 className="mb-3 font-semibold">Performance</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">
                  {profile?.ordersCompleted ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Orders</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {((profile?.onTimeRate ?? 0) as number).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">On Time</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {profile?.responseTimeAvg
                    ? `${Math.round(profile.responseTimeAvg / 60)}h`
                    : "N/A"}
                </p>
                <p className="text-xs text-muted-foreground">Avg Response</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Portfolio */}
        {images.length > 0 && (
          <div>
            <h2 className="mb-3 text-lg font-semibold">Portfolio</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
                >
                  <img
                    src={img.thumbnail_url || img.url}
                    alt={img.caption || `Portfolio image ${i + 1}`}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  {img.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="truncate text-xs text-white">
                        {img.caption}
                      </p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <Separator />
        <ReviewsSection
          designerId={designer.id}
          averageRating={profile?.ratingAvg ?? 0}
          totalReviews={profile?.totalReviews ?? 0}
        />

        {/* Lightbox Dialog */}
        <Dialog
          open={lightboxIndex !== null}
          onOpenChange={() => setLightboxIndex(null)}
        >
          <DialogContent className="max-w-4xl p-0">
            {lightboxIndex !== null && images[lightboxIndex] && (
              <div className="relative">
                <img
                  src={images[lightboxIndex].url}
                  alt={
                    images[lightboxIndex].caption ||
                    `Portfolio image ${lightboxIndex + 1}`
                  }
                  className="w-full rounded-lg"
                />
                {images[lightboxIndex].caption && (
                  <p className="p-4 text-sm text-muted-foreground">
                    {images[lightboxIndex].caption}
                  </p>
                )}
                <div className="flex justify-between p-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setLightboxIndex(
                        lightboxIndex > 0
                          ? lightboxIndex - 1
                          : images.length - 1
                      )
                    }
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {lightboxIndex + 1} / {images.length}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setLightboxIndex(
                        lightboxIndex < images.length - 1
                          ? lightboxIndex + 1
                          : 0
                      )
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
