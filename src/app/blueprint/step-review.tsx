"use client";

import { useState } from "react";
import Image from "next/image";
import { Flame, Pencil } from "lucide-react";

import { useBlueprintStore } from "@/lib/stores/blueprint";
import { useBlueprintOptions } from "@/lib/hooks/use-blueprint-options";
import { useMeasurements } from "@/lib/hooks/use-measurements";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { MeasurementSummary } from "@/components/shared/measurement-summary";

interface StepReviewProps {
  onEditStep: (step: number) => void;
}

function formatLabel(
  value: string,
  list: { value: string; label: string }[]
): string {
  return (
    list.find((o) => o.value === value)?.label ?? value.replace(/_/g, " ")
  );
}

export function StepReview({ onEditStep }: StepReviewProps) {
  const store = useBlueprintStore();
  const { options } = useBlueprintOptions();
  const { measurements } = useMeasurements();

  const selectedMeasurement = measurements.find(
    (m) => m.id === store.measurementId
  );

  const garmentLabel =
    store.garmentType === "other"
      ? store.garmentTypeOther
      : formatLabel(store.garmentType, options?.garmentTypes ?? []);

  const occasionLabel = formatLabel(
    store.occasion,
    options?.occasions ?? []
  );

  const fabricLabel =
    store.fabricType === "other"
      ? store.fabricTypeOther
      : formatLabel(store.fabricType, options?.fabricTypes ?? []);

  // Snapshot "now" once on mount via lazy initializer — calling Date.now()
  // directly during render is impure and trips React 19's purity rule. The
  // review screen is short-lived so a fresh snapshot per mount is enough.
  const [nowMs] = useState<number>(() => Date.now());
  const daysFromNow = store.deadline
    ? Math.ceil(
        (new Date(store.deadline).getTime() - nowMs) /
          (1000 * 60 * 60 * 24)
      )
    : 0;
  const isRush = daysFromNow > 0 && daysFromNow < 7;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Review your blueprint details before submitting. Tap any section to
        edit.
      </p>

      <ReviewSection title="Garment & occasion" onEdit={() => onEditStep(0)}>
        <KeyValue label="Garment" value={garmentLabel} />
        <KeyValue label="Occasion" value={occasionLabel} />
      </ReviewSection>

      <ReviewSection title="Design details" onEdit={() => onEditStep(1)}>
        {Object.entries(store.designDetails).map(([key, value]) => {
          const designOptions = options?.designFields[key] ?? [];
          const label = Array.isArray(value)
            ? value.map((v) => formatLabel(v, designOptions)).join(", ")
            : formatLabel(value, designOptions);
          return (
            <KeyValue
              key={key}
              label={key.replace(/_/g, " ")}
              value={label}
            />
          );
        })}
        {store.additionalDetails.length > 0 && (
          <KeyValue
            label="Additional"
            value={store.additionalDetails
              .map((v) =>
                formatLabel(
                  v,
                  options?.designFields["additional_detail"] ?? []
                )
              )
              .join(", ")}
          />
        )}
        {store.freeText && <KeyValue label="Notes" value={store.freeText} />}
      </ReviewSection>

      {store.referenceImages.length > 0 && (
        <ReviewSection title="Reference images" onEdit={() => onEditStep(2)}>
          <div className="grid grid-cols-5 gap-2">
            {store.referenceImages.map((img, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-xl ring-1 ring-border"
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
        </ReviewSection>
      )}

      <ReviewSection title="Fabric" onEdit={() => onEditStep(3)}>
        <KeyValue label="Type" value={fabricLabel} />
        {store.fabricColour && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Colour
            </span>
            <span className="flex items-center gap-2 text-sm font-medium">
              {store.fabricColour}
              {store.fabricColourHex && (
                <span
                  className="size-4 rounded-full ring-1 ring-border"
                  style={{ backgroundColor: store.fabricColourHex }}
                  aria-hidden
                />
              )}
            </span>
          </div>
        )}
        {store.clientProvidingFabric && (
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-copper">
            Client providing fabric
          </p>
        )}
        {store.fabricNotes && (
          <KeyValue label="Notes" value={store.fabricNotes} />
        )}
      </ReviewSection>

      <ReviewSection title="Measurements" onEdit={() => onEditStep(4)}>
        {selectedMeasurement ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-display text-sm font-semibold tracking-tight">
                {selectedMeasurement.label}
              </span>
              <span className="inline-flex items-center rounded-full border border-border bg-card/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {selectedMeasurement.source === "ai_photo"
                  ? "Fitscan AI"
                  : selectedMeasurement.source}
              </span>
            </div>
            <MeasurementSummary
              dataMm={selectedMeasurement.dataMm}
              manualOverridesMm={selectedMeasurement.manualOverridesMm}
              aiBaselineMm={selectedMeasurement.aiBaselineMm}
              compact
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No measurement selected
          </p>
        )}
      </ReviewSection>

      <ReviewSection title="Budget & timeline" onEdit={() => onEditStep(5)}>
        <KeyValue
          label="Budget"
          value={`GHS ${Number(store.budgetMin).toLocaleString()} – GHS ${Number(store.budgetMax).toLocaleString()}`}
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Deadline
          </span>
          <span className="flex items-center gap-2 text-sm font-medium tabular-nums">
            {new Date(store.deadline).toLocaleDateString()}
            {isRush && (
              <span className="inline-flex items-center gap-1 rounded-full bg-copper/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-copper-soft ring-1 ring-copper/30">
                <Flame className="h-3 w-3" aria-hidden />
                Rush
              </span>
            )}
          </span>
        </div>
        {store.notes && <KeyValue label="Notes" value={store.notes} />}
      </ReviewSection>
    </div>
  );
}

interface ReviewSectionProps {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}

function ReviewSection({ title, onEdit, children }: ReviewSectionProps) {
  return (
    <GlassCard variant="solid" className="p-5">
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-display text-sm font-semibold tracking-tight">
          {title}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={onEdit}
        >
          <Pencil className="h-3 w-3" aria-hidden />
          Edit
        </Button>
      </header>
      <div className="space-y-2 text-sm">{children}</div>
    </GlassCard>
  );
}

function KeyValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground capitalize">
        {label}
      </span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
