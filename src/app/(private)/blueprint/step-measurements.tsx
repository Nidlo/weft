"use client";

import { Camera, CheckCircle2, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { useBlueprintStore } from "@/lib/stores/blueprint";
import {
  useMeasurements,
  useCreateMeasurement,
} from "@/lib/hooks/use-measurements";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import { MeasurementSummary } from "@/components/shared/measurement-summary";
import { ManualForm } from "@/app/(private)/measurements/manual-form";
import { AiFlow } from "@/app/(private)/measurements/ai-flow";
import { cn } from "@/lib/utils";
import type { MeasurementData } from "@/types/graphql";

type Source = "saved_profile" | "manual" | "ai_photo";

const SOURCE_TILES: {
  value: Source;
  label: string;
  description: string;
  icon: typeof FileText;
}[] = [
  {
    value: "saved_profile",
    label: "Saved profile",
    description: "Pick from your Body Vault",
    icon: FileText,
  },
  {
    value: "manual",
    label: "Enter manually",
    description: "Type in your measurements",
    icon: Sparkles,
  },
  {
    value: "ai_photo",
    label: "Fitscan AI",
    description: "Extract from a photo",
    icon: Camera,
  },
];

export function StepMeasurements() {
  const { measurementSource, measurementId, setField } = useBlueprintStore();
  const { measurements, loading, refetch } = useMeasurements();
  const { createMeasurement, loading: creating } = useCreateMeasurement();

  const handleSaveNew = async (
    label: string,
    unit: string,
    data: MeasurementData,
    source: string
  ) => {
    try {
      const result = await createMeasurement({ label, unit, data, source });
      if (result) {
        setField("measurementId", result.id);
        setField("measurementSource", "saved_profile");
        refetch();
        toast.success("Measurement profile saved!");
      }
    } catch {
      toast.error("Failed to save measurement profile.");
    }
  };

  if (loading) {
    return <Skeleton className="h-40 w-full" />;
  }

  // If a source flow is active, render that flow
  if (measurementSource === "manual") {
    return (
      <ManualForm
        onSave={(label, unit, data) =>
          handleSaveNew(label, unit, data, "manual")
        }
        saving={creating}
        onCancel={() => setField("measurementSource", "")}
      />
    );
  }

  if (measurementSource === "ai_photo") {
    return (
      <AiFlow
        onComplete={(label, unit, data) =>
          handleSaveNew(label, unit, data, "ai_photo")
        }
        saving={creating}
        onCancel={() => setField("measurementSource", "")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm">
          How would you like to provide measurements?
        </Label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {SOURCE_TILES.map((tile) => {
          const Icon = tile.icon;
          const isActive = measurementSource === tile.value;
          const isDisabled =
            tile.value === "saved_profile" && measurements.length === 0;
          return (
            <button
              key={tile.value}
              type="button"
              disabled={isDisabled}
              onClick={() => setField("measurementSource", tile.value)}
              className={cn(
                "bg-card rounded-2xl border p-4 text-left transition-all duration-200",
                "hover:-translate-y-0.5 hover:shadow-(--shadow-2)",
                isActive
                  ? "border-foreground/30 bg-foreground/5 shadow-(--shadow-glow)"
                  : "border-border hover:border-foreground/30",
                isDisabled && "cursor-not-allowed opacity-50"
              )}
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl ring-1 transition-colors",
                  isActive
                    ? "bg-foreground text-background ring-transparent"
                    : "bg-secondary text-foreground ring-border"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <p className="text-display mt-3 text-sm font-semibold tracking-tight">
                {tile.label}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {tile.value === "saved_profile" && measurements.length > 0
                  ? `${measurements.length} profile${measurements.length > 1 ? "s" : ""} saved`
                  : tile.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Saved-profile selector */}
      {measurementSource === "saved_profile" && measurements.length > 0 && (
        <div className="space-y-2">
          <Label className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
            Pick a profile
          </Label>
          <div className="space-y-2">
            {measurements.map((m) => {
              const isPicked = measurementId === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setField("measurementId", m.id)}
                  className={cn(
                    "bg-card block w-full rounded-2xl border p-4 text-left transition-all duration-200",
                    "hover:-translate-y-0.5 hover:shadow-(--shadow-1)",
                    isPicked
                      ? "border-foreground/30 bg-foreground/5 shadow-(--shadow-glow)"
                      : "border-border hover:border-foreground/30"
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {isPicked && (
                      <CheckCircle2
                        className="text-copper h-4 w-4"
                        aria-hidden
                      />
                    )}
                    <span className="text-display text-sm font-semibold tracking-tight">
                      {m.label}
                    </span>
                    {m.isDefault && (
                      <span className="bg-copper/15 text-copper-soft ring-copper/30 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ring-1">
                        Default
                      </span>
                    )}
                    <span className="border-border bg-card/60 text-muted-foreground inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase">
                      {m.source === "ai_photo" ? "Fitscan AI" : m.source}
                    </span>
                  </div>
                  {isPicked && (
                    <GlassCard variant="ghost" className="mt-3 p-3">
                      <MeasurementSummary
                        dataMm={m.dataMm}
                        manualOverridesMm={m.manualOverridesMm}
                        aiBaselineMm={m.aiBaselineMm}
                        compact
                      />
                    </GlassCard>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
