"use client";

import { useBlueprintStore } from "@/lib/stores/blueprint";
import { useBlueprintOptions } from "@/lib/hooks/use-blueprint-options";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export function StepGarment() {
  const { garmentType, garmentTypeOther, occasion, setField } =
    useBlueprintStore();
  const { options, loading } = useBlueprintOptions();

  if (loading || !options) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-3 block text-base font-semibold">
          What type of garment?
        </Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {options.garmentTypes.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setField("garmentType", opt.value)}
              className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                garmentType === opt.value
                  ? "border-primary bg-primary/5 font-medium"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setField("garmentType", "other")}
            className={`rounded-lg border p-3 text-left text-sm transition-colors ${
              garmentType === "other"
                ? "border-primary bg-primary/5 font-medium"
                : "border-border hover:border-primary/50"
            }`}
          >
            Other
          </button>
        </div>
        {garmentType === "other" && (
          <Input
            className="mt-3"
            placeholder="Describe the garment type..."
            value={garmentTypeOther}
            onChange={(e) => setField("garmentTypeOther", e.target.value)}
            maxLength={100}
          />
        )}
      </div>

      <div>
        <Label className="mb-3 block text-base font-semibold">
          What&apos;s the occasion?
        </Label>
        <div className="flex flex-wrap gap-2">
          {options.occasions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setField("occasion", opt.value)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                occasion === opt.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
