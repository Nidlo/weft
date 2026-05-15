"use client";

import { MapPin } from "lucide-react";

import { LocationPicker } from "@/components/shared/location-picker";
import { useClientOnboardingStore } from "@/lib/stores/client-onboarding";
import type { LocationData } from "@/types/location";

export function StepLocation() {
  const { location, setField } = useClientOnboardingStore();

  const handleLocationChange = (loc: LocationData) => {
    setField("location", loc);
  };

  return (
    <div className="space-y-7">
      <div className="flex items-start gap-3">
        <span className="bg-secondary text-foreground flex size-9 shrink-0 items-center justify-center rounded-xl">
          <MapPin className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <h2 className="text-display text-lg font-semibold tracking-tight">
            Where are you?
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            We&apos;ll surface designers near you and show accurate delivery
            times. Skip if you&apos;d rather add this later.
          </p>
        </div>
      </div>

      <LocationPicker
        value={location}
        onChange={handleLocationChange}
        label="Your location"
        placeholder="Search for your area..."
        showMap
        mapHeight="280px"
      />
    </div>
  );
}
