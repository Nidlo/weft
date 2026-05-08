"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { ArrowLeft, ArrowRight, Camera, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { EXTRACT_AI_MEASUREMENTS } from "@/lib/graphql/mutations/ai-measurement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import { StitchLoader } from "@/components/ui/stitch-loader";
import {
  convertMeasurementData,
  inchesToCm,
  unitLabel,
  unitName,
} from "@/lib/utils/measurement";
import { usePreferencesStore } from "@/lib/stores/preferences";
import { useApplyMeasurementRescan } from "@/lib/hooks/use-measurements";
import type {
  ExtractAiMeasurementsData,
  GqlMeasurement,
  Landmarks,
  MeasurementMmData,
} from "@/types/graphql";
import { RescanDiff } from "@/components/measurements/rescan-diff";
import { LandmarkOverlay } from "@/components/measurements/landmark-overlay";

interface RescanFlowProps {
  measurement: GqlMeasurement;
  onComplete: () => void;
  onCancel: () => void;
}

type Step = "upload" | "processing" | "diff" | "applied";

export function RescanFlow({ measurement, onComplete, onCancel }: RescanFlowProps) {
  const preferredUnit = usePreferencesStore((s) => s.measurementUnit);
  const [step, setStep] = useState<Step>("upload");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [sideImage, setSideImage] = useState<File | null>(null);
  const [heightInput, setHeightInput] = useState("");
  const [proposedMm, setProposedMm] = useState<MeasurementMmData | null>(null);
  const [landmarks, setLandmarks] = useState<Landmarks | null>(null);

  const [extract, { loading: extracting }] =
    useMutation<ExtractAiMeasurementsData>(EXTRACT_AI_MEASUREMENTS);
  const { applyRescan, loading: applying } = useApplyMeasurementRescan();

  const cancelledRef = useRef(false);
  const [elapsed, setElapsed] = useState(0);

  // Tick elapsed seconds while processing. We compute from an absolute start
  // timestamp so re-entering "processing" naturally restarts at 0 on the
  // first tick — without a synchronous setState in the effect body
  // (React 19 cascading-render rule).
  useEffect(() => {
    if (step !== "processing") return;
    const start = Date.now();
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  const handleExtract = async () => {
    if (!frontImage) {
      toast.error("Please upload a front photo.");
      return;
    }

    cancelledRef.current = false;
    setStep("processing");

    try {
      const variables: Record<string, unknown> = { frontImage };
      if (sideImage) variables.sideImage = sideImage;
      if (heightInput) {
        const parsed = parseFloat(heightInput);
        if (!Number.isNaN(parsed)) {
          variables.heightCm =
            preferredUnit === "inches" ? inchesToCm(parsed) : parsed;
        }
      }

      const { data } = await extract({ variables });
      if (cancelledRef.current) return;

      const result = data?.extractAiMeasurements ?? null;
      if (!result?.data) {
        toast.error("No measurements were returned. Try a different photo.");
        setStep("upload");
        return;
      }

      // The extract mutation returns the data in cm (per fitscan boundary).
      // Convert to mm for the diff view, which is the canonical unit.
      const proposed = convertMeasurementData(
        result.data as Record<string, Record<string, number | null>>,
        "cm",
        "mm",
      );
      setProposedMm(proposed as MeasurementMmData);
      setLandmarks(result.landmarks ?? null);
      setStep("diff");
    } catch (err) {
      if (cancelledRef.current) return;
      const msg =
        err instanceof Error ? err.message : "Couldn't extract from that photo.";
      toast.error(`Re-scan failed: ${msg}`);
      setStep("upload");
    }
  };

  const handleApply = async (
    confirmedFields: Array<{ section: string; field: string }>,
  ) => {
    if (!proposedMm) return;

    // applyRescan on the server expects the proposed payload in the row's
    // unit; the simplest contract is: send mm-derived cm so the server's
    // payloadToMm round-trips back to the same integers.
    const proposedCm = convertMeasurementData(proposedMm, "mm", "cm");

    try {
      const result = await applyRescan(measurement.id, {
        data: proposedCm,
        unit: "cm",
        confirmedFields,
      });

      if (!result) {
        toast.error("Could not apply re-scan.");
        return;
      }

      const applied = result.applied.length;
      const rejected = result.rejected.length;
      const messages: string[] = [];
      if (applied > 0) messages.push(`${applied} field${applied === 1 ? "" : "s"} updated`);
      if (rejected > 0) messages.push(`${rejected} rejected`);
      toast.success(messages.length > 0 ? messages.join(" · ") : "No changes applied.");
      setStep("applied");
      onComplete();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Couldn't apply re-scan.";
      toast.error(msg);
    }
  };

  if (step === "upload") {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>

        <header>
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
            <Sparkles className="h-3 w-3 text-copper" aria-hidden />
            Re-scan
          </p>
          <h1 className="text-display mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Update {measurement.label}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload a fresh photo. We&apos;ll diff it against your saved
            measurements and ask you to confirm meaningful changes.
          </p>
        </header>

        <GlassCard variant="solid" className="space-y-5 p-5 sm:p-6">
          <div className="space-y-2">
            <Label htmlFor="rescan-front">Front photo *</Label>
            <Input
              id="rescan-front"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFrontImage(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rescan-side">Side photo (optional)</Label>
            <Input
              id="rescan-side"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setSideImage(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rescan-height">
              Your height in {unitName(preferredUnit).toLowerCase()} (optional)
            </Label>
            <Input
              id="rescan-height"
              type="number"
              step={preferredUnit === "inches" ? "0.25" : "0.1"}
              min={preferredUnit === "inches" ? "39" : "100"}
              max={preferredUnit === "inches" ? "98" : "250"}
              value={heightInput}
              placeholder={preferredUnit === "inches" ? "e.g. 67" : "e.g. 170"}
              onChange={(e) => setHeightInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Providing your height improves accuracy. Enter in{" "}
              {unitLabel(preferredUnit)}; we convert automatically.
            </p>
          </div>
        </GlassCard>

        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button
            variant="luxe"
            size="xl"
            className="gap-1.5 sm:flex-1"
            onClick={handleExtract}
            disabled={!frontImage || extracting}
          >
            <Camera className="h-4 w-4" aria-hidden />
            Analyse photo
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="xl"
            onClick={onCancel}
            className="text-muted-foreground"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (step === "processing") {
    const stage =
      elapsed < 4
        ? "Detecting body landmarks..."
        : elapsed < 10
          ? "Computing measurements..."
          : elapsed < 20
            ? "Refining results..."
            : "Almost there...";
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <StitchLoader size={32} tone="copper" label="Analysing photo" />
        <p className="mt-4 text-sm font-medium">{stage}</p>
        <p className="mt-1 text-xs tabular-nums text-muted-foreground">
          {elapsed}s elapsed · usually 5–15s
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-6"
          onClick={() => {
            cancelledRef.current = true;
            setStep("upload");
          }}
        >
          Cancel
        </Button>
      </div>
    );
  }

  if (step === "diff" && proposedMm) {
    return (
      <div className="space-y-6">
        {/* S2.5b — editable landmark overlay so the user can drag-correct
            occluded points before approving the diff. Corrections are
            captured in local `landmarks` state but not yet persisted on
            re-scan apply (S2.5c will wire that through applyRescan). */}
        {frontImage && landmarks && (
          <LandmarkOverlay
            photo={frontImage}
            landmarks={landmarks}
            editable
            onLandmarksChange={setLandmarks}
          />
        )}
        <RescanDiff
          baselineMm={measurement.dataMm}
          proposedMm={proposedMm}
          onApply={handleApply}
          applying={applying}
          onCancel={onCancel}
        />
      </div>
    );
  }

  // step === "applied" — typically immediately replaced by onComplete
  return null;
}
