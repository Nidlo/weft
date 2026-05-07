"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePreferencesStore } from "@/lib/stores/preferences";

interface UnitToggleProps {
  id?: string;
  className?: string;
  showLabel?: boolean;
}

export function UnitToggle({
  id = "measurement-unit-toggle",
  className,
  showLabel = true,
}: UnitToggleProps) {
  const measurementUnit = usePreferencesStore((s) => s.measurementUnit);
  const toggle = usePreferencesStore((s) => s.toggleMeasurementUnit);
  const inches = measurementUnit === "inches";

  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      {showLabel && (
        <Label htmlFor={id} className="text-sm">
          Unit
        </Label>
      )}
      <span
        className={`text-xs ${inches ? "text-muted-foreground" : "font-semibold"}`}
      >
        cm
      </span>
      <Switch
        id={id}
        checked={inches}
        onCheckedChange={toggle}
        aria-label={`Switch measurement unit, currently ${inches ? "inches" : "centimeters"}`}
      />
      <span
        className={`text-xs ${inches ? "font-semibold" : "text-muted-foreground"}`}
      >
        inches
      </span>
    </div>
  );
}
