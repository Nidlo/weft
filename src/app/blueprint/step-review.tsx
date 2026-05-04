"use client";

import Image from "next/image";
import { useBlueprintStore } from "@/lib/stores/blueprint";
import { useBlueprintOptions } from "@/lib/hooks/use-blueprint-options";
import { useMeasurements } from "@/lib/hooks/use-measurements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MeasurementSummary } from "@/components/shared/measurement-summary";

interface StepReviewProps {
  onEditStep: (step: number) => void;
}

function formatLabel(value: string, list: { value: string; label: string }[]): string {
  return list.find((o) => o.value === value)?.label ?? value.replace(/_/g, " ");
}

export function StepReview({ onEditStep }: StepReviewProps) {
  const store = useBlueprintStore();
  const { options } = useBlueprintOptions();
  const { measurements } = useMeasurements();

  const selectedMeasurement = measurements.find(
    (m) => m.id === store.measurementId
  );

  const garmentLabel = store.garmentType === "other"
    ? store.garmentTypeOther
    : formatLabel(store.garmentType, options?.garmentTypes ?? []);

  const occasionLabel = formatLabel(
    store.occasion,
    options?.occasions ?? []
  );

  const fabricLabel = store.fabricType === "other"
    ? store.fabricTypeOther
    : formatLabel(store.fabricType, options?.fabricTypes ?? []);

  const daysFromNow = store.deadline
    ? Math.ceil(
        (new Date(store.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : 0;
  const isRush = daysFromNow > 0 && daysFromNow < 7;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Review your blueprint details before submitting.
      </p>

      {/* Step 1: Garment & Occasion */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm">Garment & Occasion</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEditStep(0)}>
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Garment:</span>{" "}
            {garmentLabel}
          </p>
          <p>
            <span className="text-muted-foreground">Occasion:</span>{" "}
            {occasionLabel}
          </p>
        </CardContent>
      </Card>

      {/* Step 2: Design Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm">Design Details</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEditStep(1)}>
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          {Object.entries(store.designDetails).map(([key, value]) => {
            const designOptions = options?.designFields[key] ?? [];
            const label = Array.isArray(value)
              ? value.map((v) => formatLabel(v, designOptions)).join(", ")
              : formatLabel(value, designOptions);
            return (
              <p key={key}>
                <span className="text-muted-foreground">
                  {key.replace(/_/g, " ")}:
                </span>{" "}
                {label}
              </p>
            );
          })}
          {store.additionalDetails.length > 0 && (
            <p>
              <span className="text-muted-foreground">Additional:</span>{" "}
              {store.additionalDetails
                .map((v) =>
                  formatLabel(v, options?.designFields["additional_detail"] ?? [])
                )
                .join(", ")}
            </p>
          )}
          {store.freeText && (
            <p>
              <span className="text-muted-foreground">Notes:</span>{" "}
              {store.freeText}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Step 3: Reference Images */}
      {store.referenceImages.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Reference Images</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(2)}>
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {store.referenceImages.map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-square overflow-hidden rounded-md"
                >
                  <Image
                    src={img.url}
                    alt={img.name}
                    fill
                    sizes="(max-width: 640px) 20vw, 100px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Fabric */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm">Fabric</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEditStep(3)}>
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Type:</span> {fabricLabel}
          </p>
          {store.fabricColour && (
            <p>
              <span className="text-muted-foreground">Colour:</span>{" "}
              {store.fabricColour}
              {store.fabricColourHex && (
                <span
                  className="ml-2 inline-block h-3 w-3 rounded-full border"
                  style={{ backgroundColor: store.fabricColourHex }}
                />
              )}
            </p>
          )}
          {store.clientProvidingFabric && (
            <Badge variant="outline">Client providing fabric</Badge>
          )}
          {store.fabricNotes && (
            <p>
              <span className="text-muted-foreground">Notes:</span>{" "}
              {store.fabricNotes}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Step 5: Measurements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm">Measurements</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEditStep(4)}>
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          {selectedMeasurement ? (
            <div>
              <p className="mb-2 text-sm font-medium">
                {selectedMeasurement.label}
                <Badge variant="outline" className="ml-2">
                  {selectedMeasurement.source}
                </Badge>
              </p>
              <MeasurementSummary
                data={selectedMeasurement.data}
                unit={selectedMeasurement.unit}
                compact
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No measurement selected
            </p>
          )}
        </CardContent>
      </Card>

      {/* Step 6: Budget & Timeline */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm">Budget & Timeline</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEditStep(5)}>
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Budget:</span> GHS{" "}
            {Number(store.budgetMin).toLocaleString()} – GHS{" "}
            {Number(store.budgetMax).toLocaleString()}
          </p>
          <p>
            <span className="text-muted-foreground">Deadline:</span>{" "}
            {new Date(store.deadline).toLocaleDateString()}
            {isRush && (
              <Badge variant="destructive" className="ml-2">
                Rush
              </Badge>
            )}
          </p>
          {store.notes && (
            <p>
              <span className="text-muted-foreground">Notes:</span>{" "}
              {store.notes}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
