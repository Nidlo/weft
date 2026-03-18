"use client";

import { LocationPicker } from "@/components/shared/location-picker";
import { useClientOnboardingStore } from "@/lib/stores/client-onboarding";
import type { LocationData } from "@/types/location";

export function StepLocation() {
  const { location, setField } = useClientOnboardingStore();

  const handleLocationChange = (loc: LocationData) => {
    setField("location", loc);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Where are you located?</h2>
        <p className="text-sm text-muted-foreground">
          This helps us find designers near you. You can skip this step and add
          it later.
        </p>
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
