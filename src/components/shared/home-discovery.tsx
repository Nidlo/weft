"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client/react";

import { DesignerScrollSection } from "@/components/shared/designer-scroll-section";
import { Section } from "@/components/ui/section";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  useTopRated,
  useNewDesigners,
  useNearbyDesigners,
} from "@/lib/hooks/use-discovery";
import { useGeolocation } from "@/lib/hooks/use-geolocation";
import { useSpecializations } from "@/lib/hooks/use-specializations";
import { useCities } from "@/lib/hooks/use-cities";
import { GET_COUNTRIES } from "@/lib/graphql/queries/designer";
import { cn } from "@/lib/utils";

export function HomeDiscovery() {
  const { lat, lng } = useGeolocation();
  const { quickFilters } = useSpecializations();
  const topRated = useTopRated();
  const newest = useNewDesigners();
  const nearby = useNearbyDesigners(lat, lng);

  // Warm the cache for /auth/phone (Countries) and /search + /onboarding
  // (Cities) while the user dwells on /. cache-first → no network if
  // already cached. By the time they click "Get started" the country
  // picker can render synchronously instead of waiting on a slot in the
  // already-saturated HTTP/1.1 connection pool.
  useQuery(GET_COUNTRIES, {
    variables: { activeOnly: true },
    fetchPolicy: "cache-first",
  });
  useCities();

  return (
    <div className="space-y-2">
      {quickFilters.length > 0 && (
        <Section density="compact" eyebrow="Discover" title="Browse by craft">
          <ScrollArea className="-mx-4 w-screen sm:mx-0 sm:w-full">
            <div
              data-tour-id="home.quick-filters"
              className="flex gap-2 px-4 pb-3 sm:px-0"
            >
              {quickFilters.map((spec) => (
                <Link
                  key={spec.id}
                  href={`/search?spec=${spec.slug}`}
                  className={cn(
                    "group border-border bg-card inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium",
                    "transition-colors duration-150",
                    "hover:border-foreground/30 hover:bg-foreground hover:text-background"
                  )}
                >
                  <span className="bg-copper size-1 rounded-full" aria-hidden />
                  {spec.name}
                </Link>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Section>
      )}

      <div data-tour-id="home.discovery-rails">
        <DesignerScrollSection
          eyebrow="Acclaimed"
          title="Top-rated designers"
          designers={topRated.designers}
          loading={topRated.loading}
          browseHref="/search?sort=rating"
        />
      </div>

      {(nearby.loading || nearby.designers.length > 0) && (
        <DesignerScrollSection
          eyebrow="Local"
          title="Near you"
          designers={nearby.designers}
          loading={nearby.loading}
          browseHref="/search?sort=distance"
        />
      )}

      <DesignerScrollSection
        eyebrow="Fresh"
        title="New on Nidlo"
        designers={newest.designers}
        loading={newest.loading}
        browseHref="/search?sort=newest"
      />
    </div>
  );
}
