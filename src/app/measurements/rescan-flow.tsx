"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { ArrowLeft, ArrowRight, Camera, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { EXTRACT_AI_MEASUREMENTS } from "@/lib/graphql/mutations/ai-measurement";
import { ME_QUERY } from "@/lib/graphql/queries/auth";
import { useAuthStore } from "@/lib/stores/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import { StitchLoader } from "@/components/ui/stitch-loader";
import type { MeasurementUnit } from "@/lib/utils/measurement";
import {
  cmToInches,
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

export function RescanFlow({
  measurement,
  onComplete,
  onCancel,
}: RescanFlowProps) {
  const preferredUnit = usePreferencesStore((s) => s.measurementUnit);
  const storedHeightCm = useAuthStore((s) => s.user?.heightCm ?? null);
  const [step, setStep] = useState<Step>("upload");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [sideImage, setSideImage] = useState<File | null>(null);
  // Height-input unit defaults to cm regardless of the global preferredUnit
  // (which governs how garment measurements are displayed). The toggle next
  // to the label lets users switch on the fly — see the matching block in
  // ai-flow.tsx for the rationale.
  const [heightInputUnit, setHeightInputUnit] = useState<MeasurementUnit>("cm");
  // Seed from the user's saved height (always cm on the server) — rescans
  // usually happen weeks/months after the original scan and the user
  // shouldn't have to re-type it. They can still override in the input.
  const [heightInput, setHeightInput] = useState(() =>
    storedHeightCm === null ? "" : storedHeightCm.toString()
  );

  const handleHeightUnitChange = (next: MeasurementUnit) => {
    if (next === heightInputUnit) return;
    const parsed = parseFloat(heightInput);
    if (!Number.isNaN(parsed)) {
      const converted =
        next === "inches" ? cmToInches(parsed) : inchesToCm(parsed);
      setHeightInput(converted.toFixed(next === "inches" ? 1 : 0));
    }
    setHeightInputUnit(next);
  };
  const [proposedMm, setProposedMm] = useState<MeasurementMmData | null>(null);
  const [landmarks, setLandmarks] = useState<Landmarks | null>(null);

  const [extract, { loading: extracting }] =
    useMutation<ExtractAiMeasurementsData>(EXTRACT_AI_MEASUREMENTS, {
      refetchQueries: [{ query: ME_QUERY }],
    });
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

    // Range-check in cm before sending — mirrors the server's 50–250 guard.
    // The cm conversion uses `heightInputUnit` (the per-field toggle),
    // which is independent of the global preferredUnit display setting.
    let heightCmForRequest: number | null = null;
    if (heightInput) {
      const parsed = parseFloat(heightInput);
      if (!Number.isNaN(parsed)) {
        const cm = heightInputUnit === "inches" ? inchesToCm(parsed) : parsed;
        if (cm < 50 || cm > 250) {
          const unit = unitName(heightInputUnit).toLowerCase();
          toast.error(
            `Height looks off — please enter a realistic value in ${unit}, or switch units above.`
          );
          return;
        }
        heightCmForRequest = cm;
      }
    }

    cancelledRef.current = false;
    setStep("processing");

    try {
      const variables: Record<string, unknown> = { frontImage };
      if (sideImage) variables.sideImage = sideImage;
      if (heightCmForRequest !== null) {
        variables.heightCm = heightCmForRequest;
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
        "mm"
      );
      setProposedMm(proposed as MeasurementMmData);
      setLandmarks(result.landmarks ?? null);
      setStep("diff");
    } catch (err) {
      if (cancelledRef.current) return;
      const msg =
        err instanceof Error
          ? err.message
          : "Couldn't extract from that photo.";
      toast.error(`Re-scan failed: ${msg}`);
      setStep("upload");
    }
  };

  const handleApply = async (
    confirmedFields: Array<{ section: string; field: string }>
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
      if (applied > 0)
        messages.push(`${applied} field${applied === 1 ? "" : "s"} updated`);
      if (rejected > 0) messages.push(`${rejected} rejected`);
      toast.success(
        messages.length > 0 ? messages.join(" · ") : "No changes applied."
      );
      setStep("applied");
      onComplete();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Couldn't apply re-scan.";
      toast.error(msg);
    }
  };

  if (step === "upload") {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>

        <header>
          <p className="text-copper inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.18em] uppercase">
            <Sparkles className="text-copper h-3 w-3" aria-hidden />
            Re-scan
          </p>
          <h1 className="text-display mt-2 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            Update {measurement.label}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
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
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="rescan-height">Your height (optional)</Label>
              <div
                role="group"
                aria-label="Height unit"
                className="border-border bg-muted/40 inline-flex overflow-hidden rounded-md border text-xs"
              >
                {(["cm", "inches"] as const).map((u) => {
                  const active = heightInputUnit === u;
                  return (
                    <button
                      key={u}
                      type="button"
                      aria-pressed={active ? "true" : "false"}
                      onClick={() => handleHeightUnitChange(u)}
                      className={
                        "px-2.5 py-1 font-medium tracking-wide uppercase transition-colors " +
                        (active
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground")
                      }
                    >
                      {u === "cm" ? "cm" : "in"}
                    </button>
                  );
                })}
              </div>
            </div>
            <Input
              id="rescan-height"
              type="number"
              step={heightInputUnit === "inches" ? "0.25" : "0.1"}
              min={heightInputUnit === "inches" ? "39" : "100"}
              max={heightInputUnit === "inches" ? "98" : "250"}
              value={heightInput}
              placeholder={
                heightInputUnit === "inches" ? "e.g. 67" : "e.g. 170"
              }
              onChange={(e) => setHeightInput(e.target.value)}
            />
            <p className="text-muted-foreground text-xs">
              Providing your height improves accuracy. We&apos;ll remember it
              for next time.
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
        <p className="text-muted-foreground mt-1 text-xs tabular-nums">
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
