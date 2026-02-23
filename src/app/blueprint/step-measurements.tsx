"use client";

import { useBlueprintStore } from "@/lib/stores/blueprint";
import { useMeasurements, useCreateMeasurement } from "@/lib/hooks/use-measurements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { MeasurementSummary } from "@/components/shared/measurement-summary";
import { ManualForm } from "@/app/measurements/manual-form";
import { AiFlow } from "@/app/measurements/ai-flow";
import { toast } from "sonner";
import type { MeasurementData } from "@/types/graphql";

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

  // If a source is selected, show that flow
  if (measurementSource === "manual") {
    return (
      <ManualForm
        onSave={(label, unit, data) => handleSaveNew(label, unit, data, "manual")}
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

  const selectedMeasurement = measurements.find((m) => m.id === measurementId);

  return (
    <div className="space-y-6">
      <Label className="block text-base font-semibold">
        How would you like to provide measurements?
      </Label>

      <div className="grid gap-3 sm:grid-cols-3">
        {/* Saved Profiles */}
        <Card
          className={`cursor-pointer transition-colors ${
            measurementSource === "saved_profile"
              ? "border-primary"
              : measurements.length === 0
                ? "opacity-50"
                : "hover:border-primary/50"
          }`}
          onClick={() => {
            if (measurements.length > 0) {
              setField("measurementSource", "saved_profile");
            }
          }}
        >
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm">Saved Profile</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-muted-foreground">
              {measurements.length > 0
                ? `${measurements.length} profile${measurements.length > 1 ? "s" : ""} saved`
                : "No saved profiles"}
            </p>
          </CardContent>
        </Card>

        {/* Manual Entry */}
        <Card
          className="cursor-pointer transition-colors hover:border-primary/50"
          onClick={() => setField("measurementSource", "manual")}
        >
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm">Enter Manually</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-muted-foreground">
              Type in your measurements
            </p>
          </CardContent>
        </Card>

        {/* AI Photo */}
        <Card
          className="cursor-pointer transition-colors hover:border-primary/50"
          onClick={() => setField("measurementSource", "ai_photo")}
        >
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm">AI Photo</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-muted-foreground">
              Extract from photos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Saved profile selection */}
      {measurementSource === "saved_profile" && (
        <div className="space-y-3">
          <Label className="block text-sm font-medium">
            Select a measurement profile
          </Label>
          {measurements.map((m) => (
            <Card
              key={m.id}
              className={`cursor-pointer transition-colors ${
                measurementId === m.id
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/50"
              }`}
              onClick={() => setField("measurementId", m.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{m.label}</span>
                  {m.isDefault && <Badge variant="secondary">Default</Badge>}
                  <Badge variant="outline">{m.source}</Badge>
                </div>
                {measurementId === m.id && (
                  <div className="mt-3">
                    <MeasurementSummary data={m.data} unit={m.unit} compact />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Show selected measurement preview */}
      {selectedMeasurement && measurementSource === "saved_profile" && (
        <p className="text-sm text-muted-foreground">
          Selected: <strong>{selectedMeasurement.label}</strong>
        </p>
      )}
    </div>
  );
}
