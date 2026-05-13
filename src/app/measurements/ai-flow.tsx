"use client";

import { useMemo, useRef, useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { EXTRACT_AI_MEASUREMENTS } from "@/lib/graphql/mutations/ai-measurement";
import { ME_QUERY } from "@/lib/graphql/queries/auth";
import { useAuthStore } from "@/lib/stores/auth";
import { useScanJob } from "@/lib/hooks/use-scan-job";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import { StitchLoader } from "@/components/ui/stitch-loader";
import type {
  Landmarks,
  MeasurementData,
  ExtractAiMeasurementsData,
} from "@/types/graphql";
import { ManualForm } from "./manual-form";
import { usePreferencesStore } from "@/lib/stores/preferences";
import type { MeasurementUnit } from "@/lib/utils/measurement";
import {
  cmToInches,
  convertMeasurementData,
  inchesToCm,
  recomputeFromLandmarks,
  unitLabel,
  unitName,
} from "@/lib/utils/measurement";
import { cn } from "@/lib/utils";
import { LandmarkOverlay } from "@/components/measurements/landmark-overlay";

interface AiFlowProps {
  onComplete: (
    label: string,
    unit: string,
    data: MeasurementData,
    landmarks: Landmarks | null,
    photoUrl: string | null,
    photoPublicId: string | null,
    photoDisk: string | null
  ) => Promise<void>;
  saving?: boolean;
  onCancel?: () => void;
}

type AiStep = "instructions" | "upload" | "processing" | "review";

const TIPS = [
  "Wear fitted clothing — avoid baggy or loose layers.",
  "Stand in a well-lit area with a plain background.",
  "Keep your full body in frame, head to toe.",
  "Stand straight with arms slightly away from your sides.",
  "A side photo improves accuracy (optional but recommended).",
];

/**
 * Map a backend `ScanJobErrorCategory` to user-facing copy. The free-form
 * `errorMessage` is only used as a fallback — by category we know enough
 * to suggest a specific retry action.
 */
function scanFailureMessage(
  category: string | null,
  rawMessage: string | null
): string {
  switch (category) {
    case "image_quality":
      return "The photo didn't pass quality checks. Try a clearer shot with better lighting and a plain background.";
    case "upstream_unavailable":
      return "The measurement service is offline right now. Try again in a minute, or enter measurements manually.";
    case "upstream_error":
      return "The measurement service hit a snag. Try a different photo, or enter measurements manually.";
    case "claude_failed":
      return "We extracted measurements but our review check is unavailable. Please verify the values yourself before saving.";
    default:
      return (
        rawMessage ??
        "We couldn't complete the scan. Try a different photo, or enter measurements manually."
      );
  }
}

export function AiFlow({ onComplete, saving = false, onCancel }: AiFlowProps) {
  const preferredUnit = usePreferencesStore((s) => s.measurementUnit);
  const storedHeightCm = useAuthStore((s) => s.user?.heightCm ?? null);
  const [aiStep, setAiStep] = useState<AiStep>("instructions");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [sideImage, setSideImage] = useState<File | null>(null);
  // The height-input unit is deliberately INDEPENDENT of the global
  // `preferredUnit` (which governs how measurement results are displayed).
  // People typically know their height in cm even when they prefer to view
  // garment measurements in inches — defaulting to cm here removes the
  // most common "I typed 170 in an inches field" trap. The toggle next to
  // the label lets users switch on the fly.
  const [heightInputUnit, setHeightInputUnit] = useState<MeasurementUnit>("cm");
  // Stored as a free-text string in `heightInputUnit`; converted to cm
  // only at submit time. Seeds from the user's saved height (always in cm
  // on the server) — the backend persists the value on first capture and
  // falls back to it whenever the arg is omitted.
  const [heightInput, setHeightInput] = useState(() =>
    storedHeightCm === null ? "" : storedHeightCm.toString()
  );
  // Phase A1 (Sprint 34) — track whether the user has actually edited the
  // height. The previous UX silently pre-filled the saved value and the
  // user couldn't tell that a stale 170 from an earlier test was carrying
  // forward into every scan. Now we surface a "Saved · tap to update"
  // chip whenever the value is still the seeded stored one, which forces
  // the user to confirm or change rather than auto-submitting a stale value.
  const [heightWasEdited, setHeightWasEdited] = useState(false);
  const heightIsFromSaved =
    storedHeightCm !== null && !heightWasEdited && heightInput !== "";

  // Phase D (Sprint 34) — optional reference-object scale. When the user
  // holds a known-size object (credit card ≈ 8.56 cm, A4 = 21 cm) visibly
  // in the photo, Fitscan calibrates pixel-to-cm directly from it,
  // eliminating the height-input typo class of error.
  const [refObjectCm, setRefObjectCm] = useState("");

  const handleHeightUnitChange = (next: MeasurementUnit) => {
    if (next === heightInputUnit) return;
    const parsed = parseFloat(heightInput);
    if (!Number.isNaN(parsed)) {
      const converted =
        next === "inches" ? cmToInches(parsed) : inchesToCm(parsed);
      setHeightInput(converted.toFixed(next === "inches" ? 1 : 0));
    }
    setHeightInputUnit(next);
    // Switching the unit alone shouldn't dismiss the "saved" indicator —
    // the value is still the saved one, just displayed differently.
  };
  const [extractedData, setExtractedData] = useState<MeasurementData | null>(
    null
  );
  const [extractedLandmarks, setExtractedLandmarks] =
    useState<Landmarks | null>(null);
  // S2.5c — disk-aware photo references captured from extractAiMeasurements
  // so the saved overlay can re-render on revisit. The triplet
  // (url / public_id / disk) is what the backend resolver needs to
  // build the right URL at read time. Pass through verbatim on save.
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPublicId, setPhotoPublicId] = useState<string | null>(null);
  const [photoDisk, setPhotoDisk] = useState<string | null>(null);
  // FS-NIDLO-VALID-03 — Structured signals from the AI run. When
  // non-empty (e.g. ["validators_disagree"]) we render a "Manual
  // review recommended" notice on the review step so designers /
  // clients know to scrutinise the values before saving.
  const [degradedModes, setDegradedModes] = useState<string[]>([]);
  // S2.5d — bumping this key remounts ManualForm so a recompute apply can
  // re-seed `initialData`. We don't want to remount on every drag (kills
  // focus + in-progress edits), only on explicit "Apply".
  const [formKey, setFormKey] = useState(0);
  // Baseline mm payload derived from the AI extraction's cm payload.
  // The recompute helper anchors scale via `vertical.full_height` in mm,
  // so we convert once here and feed it to the banner.
  const baselineMmFromExtracted = useMemo(() => {
    if (!extractedData) return null;
    return convertMeasurementData(
      extractedData as Record<string, Record<string, number | null>>,
      "cm",
      "mm"
    );
  }, [extractedData]);

  // Sprint 34 Phase A3 — anthropometric flags arrive as
  // `anthropometric:<field>` entries inside `degradedModes`. Strip the
  // prefix and map the backend column names onto ManualForm field keys so
  // each flagged field renders a "Low confidence" badge inline.
  const lowConfidenceFields = useMemo(() => {
    const fields = new Set<string>();
    for (const mode of degradedModes) {
      if (!mode.startsWith("anthropometric:")) continue;
      const raw = mode.slice("anthropometric:".length);
      // Map Fitscan field names (e.g. `around_arm_cm`, `hip_cm`) onto the
      // ManualForm keys (`bicep`, `hips`). Mirrors AiMeasurementService's
      // FIELD_MAP on the backend.
      const mapped = (
        {
          waist_cm: "waist",
          hip_cm: "hips",
          bust_cm: "bust",
          chest_cm: "bust",
          under_breast_waist_cm: "underbust",
          neck_cm: "neck",
          thigh_cm: "thigh",
          around_arm_cm: "bicep",
          wrist_cm: "wrist",
          knee_cm: "knee",
          ankle_cm: "ankle",
          shoulder_cm: "shoulder",
          sleeve_length_cm: "arm_length",
          nape_to_waist_cm: "back_length",
          inseam_cm: "inseam",
          outseam_cm: "outseam",
          height_cm: "full_height",
          shoulder_to_waist_cm: "shoulder_to_waist",
          waist_to_knee_cm: "waist_to_knee",
          waist_to_floor_cm: "waist_to_floor",
        } as const
      )[raw as keyof object];
      if (mapped) fields.add(mapped);
    }
    return fields;
  }, [degradedModes]);

  const [extractMeasurements, { loading: extracting }] =
    useMutation<ExtractAiMeasurementsData>(EXTRACT_AI_MEASUREMENTS, {
      // The resolver persists `heightCm` to the user on first capture (or
      // any later correction). Refetch Me so AuthProvider sees the new
      // value — the next scan in this session can then read it without
      // a page reload.
      refetchQueries: [{ query: ME_QUERY }],
    });

  // Sprint 33a — the mutation now returns a jobId; the scan runs in a
  // queued worker. useScanJob polls until terminal status, then fires
  // onCompleted / onFailed callbacks. Setting state from callbacks (not a
  // projection effect) avoids React 19's set-state-in-effect rule.
  const [scanJobId, setScanJobId] = useState<string | null>(null);
  const { elapsedSeconds: elapsed } = useScanJob(scanJobId, {
    onCompleted: (job) => {
      if (cancelledRef.current || !job.result) return;
      setExtractedData(job.result.data ?? null);
      setExtractedLandmarks(job.result.landmarks ?? null);
      setPhotoUrl(job.result.photoUrl ?? null);
      setPhotoPublicId(job.result.photoPublicId ?? null);
      setPhotoDisk(job.result.photoDisk ?? null);
      setDegradedModes(job.result.degradedModes ?? []);
      setAiStep("review");
      setScanJobId(null);
    },
    onFailed: (job) => {
      if (cancelledRef.current) return;
      const friendly = scanFailureMessage(job.errorCategory, job.errorMessage);
      toast.error(friendly, { duration: 6000 });
      setAiStep("upload");
      setScanJobId(null);
    },
  });

  const cancelledRef = useRef(false);

  const handleCancelProcessing = () => {
    cancelledRef.current = true;
    setScanJobId(null);
    setAiStep("upload");
    toast.info("Cancelled. You can re-upload or enter measurements manually.");
  };

  const handleExtract = async () => {
    if (!frontImage) {
      toast.error("Please upload a front photo.");
      return;
    }

    // Pre-validate the height range client-side. The server enforces 50–250 cm;
    // bouncing a clearly-bad value here saves the round-trip and gives a
    // unit-aware hint via `heightInputUnit` (which is independent of the
    // global preferredUnit — see the heightInputUnit declaration above).
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
    setAiStep("processing");

    try {
      const variables: Record<string, unknown> = { frontImage };
      if (sideImage) variables.sideImage = sideImage;
      if (heightCmForRequest !== null) {
        variables.heightCm = heightCmForRequest;
      }
      // Phase D: pass reference-object size when supplied. Server validates
      // the 1-100 cm band; we send anything non-empty and parseable.
      if (refObjectCm) {
        const parsedRef = parseFloat(refObjectCm);
        if (!Number.isNaN(parsedRef) && parsedRef > 0) {
          variables.referenceObjectCm = parsedRef;
        }
      }

      const { data } = await extractMeasurements({ variables });
      if (cancelledRef.current) return;

      const jobId = data?.extractAiMeasurements?.id ?? null;
      if (!jobId) {
        toast.error(
          "We couldn't queue the scan. Try again, or enter measurements manually.",
          { duration: 6000 }
        );
        setAiStep("upload");
        return;
      }
      // useScanJob starts polling on jobId change; the projection effect
      // above flips us into "review" or back to "upload" on completion.
      setScanJobId(jobId);
    } catch (err) {
      if (cancelledRef.current) return;
      // This catch only fires for synchronous mutation failures — height
      // validation errors, network/CSRF blowups, GraphQL schema mismatches.
      // The async-pipeline errors flow through the scanJob projection
      // effect with a proper errorCategory, not through here.
      const raw = err instanceof Error ? err.message : "";
      const isValidation =
        raw.includes("Height must be") || raw.includes("your height");
      const friendly = isValidation
        ? raw
        : "We couldn't queue the scan. Check your connection and try again.";
      toast.error(friendly, { duration: 6000 });
      setAiStep("upload");
    }
  };

  if (aiStep === "instructions") {
    return (
      <div className="space-y-6">
        <header>
          <p className="text-copper inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.18em] uppercase">
            <Sparkles className="text-copper h-3 w-3" aria-hidden />
            Fitscan AI
          </p>
          <h1 className="text-display mt-2 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            Measure with a photo.
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Snap two photos, get measurements in seconds. For best accuracy,
            follow these guidelines.
          </p>
        </header>

        <GlassCard variant="solid" className="space-y-4 p-5 sm:p-6">
          <div className="text-copper flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] uppercase">
            <Lightbulb className="h-3.5 w-3.5" aria-hidden />
            Photo guidelines
          </div>
          <ol className="space-y-3">
            {TIPS.map((tip, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="text-display bg-secondary text-foreground/80 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums">
                  {i + 1}
                </span>
                <span className="text-foreground/85 leading-relaxed">
                  {tip}
                </span>
              </li>
            ))}
          </ol>
        </GlassCard>

        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button
            variant="luxe"
            size="xl"
            className="gap-1.5 sm:flex-1"
            onClick={() => setAiStep("upload")}
          >
            Continue
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
          {onCancel && (
            <Button
              variant="ghost"
              size="xl"
              className="text-muted-foreground"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (aiStep === "upload") {
    return (
      <div className="space-y-6">
        <header>
          <p className="text-copper inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.18em] uppercase">
            <Sparkles className="text-copper h-3 w-3" aria-hidden />
            Fitscan AI · Step 2
          </p>
          <h1 className="text-display mt-2 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            Upload your photos.
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            A front photo is required. A side photo improves accuracy.
          </p>
        </header>

        <GlassCard variant="solid" className="space-y-5 p-5 sm:p-6">
          <PhotoField
            id="front-photo"
            label="Front photo"
            required
            file={frontImage}
            onChange={setFrontImage}
          />
          <PhotoField
            id="side-photo"
            label="Side photo"
            file={sideImage}
            onChange={setSideImage}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="height" className="text-sm">
                Your height{" "}
                <span className="text-muted-foreground">(optional)</span>
                {heightIsFromSaved && (
                  <span className="bg-copper/15 text-copper ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                    Saved · tap to update
                  </span>
                )}
              </Label>
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
              id="height"
              type="number"
              step={heightInputUnit === "inches" ? "0.25" : "0.1"}
              min={heightInputUnit === "inches" ? "39" : "100"}
              max={heightInputUnit === "inches" ? "98" : "250"}
              placeholder={
                heightInputUnit === "inches" ? "e.g. 67" : "e.g. 170"
              }
              value={heightInput}
              onChange={(e) => {
                setHeightInput(e.target.value);
                setHeightWasEdited(true);
              }}
              className="h-11 tabular-nums"
            />
            <p className="text-muted-foreground text-xs">
              Providing your height improves accuracy. Enter in{" "}
              {unitLabel(preferredUnit)} — we convert automatically.
            </p>
          </div>

          {/* Phase D — reference-object scale. Optional, but eliminates
              the "I typed 170 but I'm actually 177" 4% scale tax on
              every other measurement. */}
          <div className="space-y-2">
            <Label htmlFor="reference-object" className="text-sm">
              Reference object size{" "}
              <span className="text-muted-foreground">(optional, cm)</span>
            </Label>
            <Input
              id="reference-object"
              type="number"
              step="0.1"
              min="1"
              max="100"
              placeholder="e.g. 8.56 (credit card)"
              value={refObjectCm}
              onChange={(e) => setRefObjectCm(e.target.value)}
              className="h-11 tabular-nums"
            />
            <p className="text-muted-foreground text-xs">
              Hold a known-size object visibly in the front photo (credit card ≈
              8.56 cm, A4 ≈ 21 cm) and enter its width here. Skips the
              height-typo problem and locks scale to a real-world object.
            </p>
          </div>
        </GlassCard>

        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button
            variant="luxe"
            size="xl"
            className="gap-1.5 sm:flex-1"
            onClick={handleExtract}
            disabled={!frontImage}
            loading={extracting}
            loadingLabel="Analyzing..."
          >
            Extract measurements
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="xl"
            className="text-muted-foreground gap-1.5"
            onClick={() => setAiStep("instructions")}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (aiStep === "processing") {
    // Stage hint based on elapsed time — keeps the user informed even though
    // the backend is opaque.
    const stage =
      elapsed < 4
        ? "Detecting body landmarks..."
        : elapsed < 10
          ? "Computing measurements..."
          : elapsed < 20
            ? "Refining results..."
            : "Almost there...";
    return (
      <GlassCard
        variant="solid"
        className="bg-thread-mesh flex flex-col items-center py-16 text-center"
      >
        <StitchLoader size={32} tone="copper" />
        <p className="text-display mt-6 text-xl font-semibold tracking-tight">
          {stage}
        </p>
        <p className="text-muted-foreground mt-2 text-xs tabular-nums">
          <span className="text-foreground font-semibold">{elapsed}s</span>{" "}
          elapsed · usually takes 5–15 seconds
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground mt-6"
          onClick={handleCancelProcessing}
        >
          Cancel
        </Button>
      </GlassCard>
    );
  }

  // Review step: show extracted data in editable manual form
  return (
    <div className="space-y-6">
      <GlassCard
        variant="solid"
        className="border-status-success-soft bg-status-success-soft/40 flex items-start gap-3 p-4"
      >
        <span className="bg-status-success/15 text-status-success flex size-9 shrink-0 items-center justify-center rounded-xl">
          <CheckCircle2 className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-status-success-fg text-[11px] font-semibold tracking-[0.16em] uppercase">
            Measurements extracted
          </p>
          <p className="text-foreground/90 mt-0.5 text-sm">
            Review and edit the values below. Anything blank wasn&apos;t
            detected — fill it in manually.
          </p>
        </div>
      </GlassCard>

      {/* FS-NIDLO-VALID-03 — surface AI-pipeline degraded signals.
          When the rule + Claude validators disagreed, render a warning
          band so the reviewer knows to scrutinise the numbers before
          saving. Empty array → component is invisible. */}
      {degradedModes.length > 0 && (
        <GlassCard
          variant="solid"
          className="border-status-warning-soft bg-status-warning-soft/40 flex items-start gap-3 p-4"
        >
          <span className="bg-status-warning/15 text-status-warning flex size-9 shrink-0 items-center justify-center rounded-xl">
            <Lightbulb className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-status-warning-fg text-[11px] font-semibold tracking-[0.16em] uppercase">
              Manual review recommended
            </p>
            <p className="text-foreground/90 mt-0.5 text-sm">
              {lowConfidenceFields.size > 0
                ? `Some values look out of proportion: ${Array.from(lowConfidenceFields).slice(0, 4).join(", ")}${lowConfidenceFields.size > 4 ? ` and ${lowConfidenceFields.size - 4} more` : ""}. They're flagged below — verify with a tape measure before saving.`
                : degradedModes.includes("validators_disagree")
                  ? "Our rule check and the AI vision check disagreed about whether this scan is reliable. Look at the values below carefully — adjust anything that doesn't match your body before saving."
                  : "The AI flagged something unusual about this scan. Review the values carefully before saving."}
            </p>
          </div>
        </GlassCard>
      )}

      {/* S2.5b / 32a — editable photo overlay. Drag dots to reposition them;
          the corrected positions persist on save via `landmarks_normalized`.
          Renders the captured photo from the local File (no backend round-trip
          for the in-flight preview — see `LandmarkOverlay`'s URL.createObjectURL
          path). When the upstream service didn't return landmarks (degraded
          pipeline path), the photo still shows so users have visual context
          for the values below. */}
      {frontImage && (
        <LandmarkOverlay
          photo={frontImage}
          landmarks={extractedLandmarks}
          editable
          onLandmarksChange={setExtractedLandmarks}
        />
      )}

      {/* S2.5d — recompute distance-based fields from corrected landmarks.
          Banner appears when the user has dragged landmarks AND those
          drags would change at least one measurement. Click "Apply" to
          fold the recomputed values into the form below. */}
      <RecomputeBanner
        baseline={extractedData}
        baselineMm={baselineMmFromExtracted}
        landmarks={extractedLandmarks}
        onApply={(updates) => {
          setExtractedData((prev) => mergeRecomputedIntoForm(prev, updates));
          setFormKey((k) => k + 1);
        }}
      />

      <ManualForm
        key={formKey}
        initialLabel="Fitscan AI"
        initialData={extractedData ?? undefined}
        lowConfidenceFields={lowConfidenceFields}
        onSave={(label, unit, data) =>
          onComplete(
            label,
            unit,
            data,
            extractedLandmarks,
            photoUrl,
            photoPublicId,
            photoDisk
          )
        }
        saving={saving}
        onCancel={onCancel}
      />
    </div>
  );
}

// ────────────────────── S2.5d — Recompute integration ──────────────────────

/**
 * Compares the current landmark-derived recompute result against the
 * baseline values displayed in the form. Returns the per-field deltas
 * (in cm — the form's display unit) that an "Apply" would push into
 * the form. An empty list means there's nothing to apply.
 */
function diffRecompute(
  recomputed: Record<string, Record<string, number>>,
  baselineMm: Record<string, Record<string, number | null>> | null
): Array<{
  section: string;
  field: string;
  cm: number;
  baselineCm: number | null;
}> {
  const out: Array<{
    section: string;
    field: string;
    cm: number;
    baselineCm: number | null;
  }> = [];
  for (const [section, fields] of Object.entries(recomputed)) {
    for (const [field, mm] of Object.entries(fields)) {
      const baselineMmValue = baselineMm?.[section]?.[field] ?? null;
      // Skip fields where the recompute lands within ~1mm of the baseline —
      // those drags didn't move that field meaningfully.
      if (baselineMmValue !== null && Math.abs(mm - baselineMmValue) < 5) {
        continue;
      }
      out.push({
        section,
        field,
        cm: Math.round((mm / 10) * 10) / 10,
        baselineCm:
          baselineMmValue === null
            ? null
            : Math.round((baselineMmValue / 10) * 10) / 10,
      });
    }
  }
  return out;
}

/**
 * Merges recomputed mm values into the form's MeasurementData (which
 * stores values in cm). Called from the parent on the user's "Apply".
 */
function mergeRecomputedIntoForm(
  prev: MeasurementData | null,
  updates: Array<{ section: string; field: string; cm: number }>
): MeasurementData {
  const next: MeasurementData = JSON.parse(
    JSON.stringify(prev ?? {})
  ) as MeasurementData;
  for (const u of updates) {
    const sec = next[u.section as keyof MeasurementData] ?? {};
    (next as Record<string, Record<string, number | null>>)[u.section] = {
      ...sec,
      [u.field]: u.cm,
    };
  }
  return next;
}

interface RecomputeBannerProps {
  baseline: MeasurementData | null;
  baselineMm: Record<string, Record<string, number | null>> | null;
  landmarks: Landmarks | null;
  onApply: (
    updates: Array<{ section: string; field: string; cm: number }>
  ) => void;
}

function RecomputeBanner({
  baseline,
  baselineMm,
  landmarks,
  onApply,
}: RecomputeBannerProps) {
  const [appliedCount, setAppliedCount] = useState(0);
  const [appliedFor, setAppliedFor] = useState<unknown>(null);

  const recomputed = useMemo(
    () => recomputeFromLandmarks(landmarks ?? null, baselineMm),
    [landmarks, baselineMm]
  );
  const deltas = useMemo(
    () => diffRecompute(recomputed, baselineMm),
    [recomputed, baselineMm]
  );

  // Reset the success indicator when the diff changes (user dragged again
  // after applying once). Render-time setState guarded by a transition ref
  // is the React 19 way to derive state from a prop change without an effect.
  if (appliedFor !== deltas) {
    setAppliedFor(deltas);
    if (appliedCount !== 0) setAppliedCount(0);
  }

  if (!baseline || !landmarks || deltas.length === 0) return null;

  return (
    <div className="border-copper/40 bg-copper/5 rounded-2xl border px-4 py-3 text-sm">
      <p className="text-copper text-[11px] font-semibold tracking-[0.16em] uppercase">
        Landmark edits ready
      </p>
      <p className="text-foreground/85 mt-1">
        {deltas.length} measurement{deltas.length === 1 ? "" : "s"} will update
        from your drag corrections:{" "}
        <span className="font-medium">
          {deltas
            .slice(0, 3)
            .map((d) => d.field.replace(/_/g, " "))
            .join(", ")}
          {deltas.length > 3 ? ` +${deltas.length - 3} more` : ""}
        </span>
        .
      </p>
      <button
        type="button"
        onClick={() => {
          onApply(deltas);
          setAppliedCount(deltas.length);
        }}
        className="text-display bg-copper text-background hover:bg-copper-soft mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
      >
        Apply {appliedCount > 0 ? "again" : "to form"}
      </button>
    </div>
  );
}

interface PhotoFieldProps {
  id: string;
  label: string;
  required?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
}

function PhotoField({ id, label, required, file, onChange }: PhotoFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-1 text-sm">
        {label}
        {required && (
          <span className="text-copper" aria-label="required">
            *
          </span>
        )}
      </Label>
      <label
        htmlFor={id}
        className={cn(
          "border-border bg-card/40 flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed p-4",
          "hover:border-copper/50 hover:bg-card transition-colors",
          file && "border-foreground/30 bg-card"
        )}
      >
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl ring-1",
            file
              ? "bg-foreground text-background ring-transparent"
              : "bg-secondary text-foreground ring-border"
          )}
        >
          {file ? (
            <CheckCircle2 className="h-4 w-4" aria-hidden />
          ) : (
            <Camera className="h-4 w-4" aria-hidden />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            {file ? file.name : "Tap to choose a photo"}
          </p>
          <p className="text-muted-foreground text-xs">
            {file
              ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
              : "JPEG, PNG, or WebP"}
          </p>
        </div>
        <Upload
          className="text-muted-foreground h-4 w-4 shrink-0"
          aria-hidden
        />
      </label>
      <Input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
