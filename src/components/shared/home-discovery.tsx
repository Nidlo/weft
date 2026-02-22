"use client";

import { DesignerScrollSection } from "@/components/shared/designer-scroll-section";
import {
  useTopRated,
  useNewDesigners,
  useNearbyDesigners,
} from "@/lib/hooks/use-discovery";
import { useGeolocation } from "@/lib/hooks/use-geolocation";
import { useSpecializations } from "@/lib/hooks/use-specializations";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Link from "next/link";

export function HomeDiscovery() {
  const { lat, lng } = useGeolocation();
  const { quickFilters } = useSpecializations();
  const topRated = useTopRated();
  const newest = useNewDesigners();
  const nearby = useNearbyDesigners(lat, lng);

  return (
    <div className="space-y-8">
      {/* Quick Filter Chips */}
      {quickFilters.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Browse by Category</h2>
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              {quickFilters.map((spec) => (
                <Link
                  key={spec.id}
                  href={`/search?spec=${spec.slug}`}
                >
                  <Badge
                    variant="outline"
                    className="shrink-0 cursor-pointer px-3 py-1.5 text-sm hover:bg-accent"
                  >
                    {spec.name}
                  </Badge>
                </Link>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>
      )}

      {/* Top Rated */}
      <DesignerScrollSection
        title="Top Rated Designers"
        designers={topRated.designers}
        loading={topRated.loading}
        browseHref="/search?sort=rating"
      />

      {/* Near You */}
      {(nearby.loading || nearby.designers.length > 0) && (
        <DesignerScrollSection
          title="Near You"
          designers={nearby.designers}
          loading={nearby.loading}
          browseHref="/search?sort=distance"
        />
      )}

      {/* Newest */}
      <DesignerScrollSection
        title="New on StitchHub"
        designers={newest.designers}
        loading={newest.loading}
        browseHref="/search?sort=newest"
      />
    </div>
  );
}
