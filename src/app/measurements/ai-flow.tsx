"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import {
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

export function AiFlow({ onComplete, saving = false, onCancel }: AiFlowProps) {
  const preferredUnit = usePreferencesStore((s) => s.measurementUnit);
  const [aiStep, setAiStep] = useState<AiStep>("instructions");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [sideImage, setSideImage] = useState<File | null>(null);
  // Stored as a free-text string in the user's preferred unit; only
  // converted to cm at the moment we send to the AI service (which
  // standardises on cm).
  const [heightInput, setHeightInput] = useState("");
  const [extractedData, setExtractedData] = useState<MeasurementData | null>(
    null
  );
  const [extractedLandmarks, setExtractedLandmarks] =
    useState<Landmarks | null>(null);
  // S2.5c — ImageKit references captured from extractAiMeasurements so the
  // saved overlay can re-render on revisit. Pass through verbatim on save.
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPublicId, setPhotoPublicId] = useState<string | null>(null);
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
      "mm",
    );
  }, [extractedData]);

  const [extractMeasurements, { loading: extracting }] =
    useMutation<ExtractAiMeasurementsData>(EXTRACT_AI_MEASUREMENTS);

  const cancelledRef = useRef(false);
  const [elapsed, setElapsed] = useState(0);

  // Tick elapsed seconds while processing so users see progress. We compute
  // from an absolute start timestamp so re-entering "processing" naturally
  // restarts at 0 on the first tick — without a synchronous setState in the
  // effect body (React 19 cascading-render rule).
  useEffect(() => {
    if (aiStep !== "processing") return;
    const start = Date.now();
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [aiStep]);

  const handleCancelProcessing = () => {
    cancelledRef.current = true;
    setAiStep("upload");
    toast.info("Cancelled. You can re-upload or enter measurements manually.");
  };

  const handleExtract = async () => {
    if (!frontImage) {
      toast.error("Please upload a front photo.");
      return;
    }

    cancelledRef.current = false;
    setAiStep("processing");

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

      const { data } = await extractMeasurements({ variables });
      if (cancelledRef.current) return;
      setExtractedData(data?.extractAiMeasurements?.data ?? null);
      setExtractedLandmarks(data?.extractAiMeasurements?.landmarks ?? null);
      setPhotoUrl(data?.extractAiMeasurements?.photoUrl ?? null);
      setPhotoPublicId(data?.extractAiMeasurements?.photoPublicId ?? null);
      setAiStep("review");
    } catch (err) {
      if (cancelledRef.current) return;
      const raw = err instanceof Error ? err.message.toLowerCase() : "";
      let friendly =
        "We couldn't extract measurements from that photo. Try a different photo, or enter your measurements manually.";
      if (
        raw.includes("no person") ||
        raw.includes("no body") ||
        raw.includes("not detected")
      ) {
        friendly =
          "We couldn't find a person in the photo. Try one with your full body in frame, on a plain background.";
      } else if (raw.includes("multiple") || raw.includes("more than one")) {
        friendly =
          "We saw more than one person in the photo. Use a photo of just yourself.";
      } else if (
        raw.includes("too small") ||
        raw.includes("resolution") ||
        raw.includes("low quality")
      ) {
        friendly =
          "The photo's resolution is too low. Take a new one in good lighting and try again.";
      } else if (
        raw.includes("blurry") ||
        raw.includes("blur") ||
        raw.includes("focus")
      ) {
        friendly =
          "The photo looks blurry. Hold your phone steady and use natural light if possible.";
      } else if (
        raw.includes("confidence") ||
        raw.includes("uncertain") ||
        raw.includes("ambiguous")
      ) {
        friendly =
          "We weren't confident enough in the result. Try a photo with fitted clothing and arms slightly away from your body.";
      } else if (
        raw.includes("network") ||
        raw.includes("fetch") ||
        raw.includes("timeout")
      ) {
        friendly =
          "We couldn't reach the measurement service. Check your connection and try again.";
      }
      toast.error(friendly, { duration: 6000 });
      setAiStep("upload");
    }
  };

  if (aiStep === "instructions") {
    return (
      <div className="space-y-6">
        <header>
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
            <Sparkles className="h-3 w-3 text-copper" aria-hidden />
            Fitscan AI
          </p>
          <h1 className="text-display mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Measure with a photo.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Snap two photos, get measurements in seconds. For best accuracy,
            follow these guidelines.
          </p>
        </header>

        <GlassCard variant="solid" className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-copper">
            <Lightbulb className="h-3.5 w-3.5" aria-hidden />
            Photo guidelines
          </div>
          <ol className="space-y-3">
            {TIPS.map((tip, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="text-display mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold tabular-nums text-foreground/80">
                  {i + 1}
                </span>
                <span className="leading-relaxed text-foreground/85">
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
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
            <Sparkles className="h-3 w-3 text-copper" aria-hidden />
            Fitscan AI · Step 2
          </p>
          <h1 className="text-display mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Upload your photos.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
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
            <Label htmlFor="height" className="text-sm">
              Your height in {unitName(preferredUnit).toLowerCase()}{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="height"
              type="number"
              step={preferredUnit === "inches" ? "0.25" : "0.1"}
              min={preferredUnit === "inches" ? "39" : "100"}
              max={preferredUnit === "inches" ? "98" : "250"}
              placeholder={
                preferredUnit === "inches" ? "e.g. 67" : "e.g. 170"
              }
              value={heightInput}
              onChange={(e) => setHeightInput(e.target.value)}
              className="h-11 tabular-nums"
            />
            <p className="text-xs text-muted-foreground">
              Providing your height improves accuracy. Enter in{" "}
              {unitLabel(preferredUnit)} — we convert automatically.
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
            {extracting ? "Analyzing…" : "Extract measurements"}
            {!extracting && <ArrowRight className="h-4 w-4" aria-hidden />}
          </Button>
          <Button
            variant="ghost"
            size="xl"
            className="gap-1.5 text-muted-foreground"
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
        ? "Detecting body landmarks…"
        : elapsed < 10
          ? "Computing measurements…"
          : elapsed < 20
            ? "Refining results…"
            : "Almost there…";
    return (
      <GlassCard
        variant="solid"
        className="bg-thread-mesh flex flex-col items-center py-16 text-center"
      >
        <StitchLoader size={28} />
        <p className="text-display mt-6 text-xl font-semibold tracking-tight">
          {stage}
        </p>
        <p className="mt-2 text-xs text-muted-foreground tabular-nums">
          <span className="font-semibold text-foreground">{elapsed}s</span>{" "}
          elapsed · usually takes 5–15 seconds
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-6 text-muted-foreground"
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
        className="flex items-start gap-3 border-status-success-soft bg-status-success-soft/40 p-4"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-status-success/15 text-status-success">
          <CheckCircle2 className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-status-success-fg">
            Measurements extracted
          </p>
          <p className="mt-0.5 text-sm text-foreground/90">
            Review and edit the values below. Anything blank wasn&rsquo;t
            detected — fill it in manually.
          </p>
        </div>
      </GlassCard>

      {/* S2.5b — editable photo overlay. Drag dots to reposition them;
          the corrected positions persist on save via `landmarks_normalized`.
          Only renders when both the upstream service returned coords AND
          the local File is still in state. */}
      {frontImage && extractedLandmarks && (
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
        onSave={(label, unit, data) =>
          onComplete(label, unit, data, extractedLandmarks, photoUrl, photoPublicId)
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
  baselineMm: Record<string, Record<string, number | null>> | null,
): Array<{ section: string; field: string; cm: number; baselineCm: number | null }> {
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
      if (
        baselineMmValue !== null &&
        Math.abs(mm - baselineMmValue) < 5
      ) {
        continue;
      }
      out.push({
        section,
        field,
        cm: Math.round((mm / 10) * 10) / 10,
        baselineCm:
          baselineMmValue === null ? null : Math.round((baselineMmValue / 10) * 10) / 10,
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
  updates: Array<{ section: string; field: string; cm: number }>,
): MeasurementData {
  const next: MeasurementData = JSON.parse(JSON.stringify(prev ?? {})) as MeasurementData;
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
  onApply: (updates: Array<{ section: string; field: string; cm: number }>) => void;
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
    [landmarks, baselineMm],
  );
  const deltas = useMemo(
    () => diffRecompute(recomputed, baselineMm),
    [recomputed, baselineMm],
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
    <div className="rounded-2xl border border-copper/40 bg-copper/5 px-4 py-3 text-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-copper">
        Landmark edits ready
      </p>
      <p className="mt-1 text-foreground/85">
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
        className="text-display mt-2 inline-flex items-center gap-1.5 rounded-full bg-copper px-3 py-1 text-xs font-semibold text-background hover:bg-copper-soft"
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
          "flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-border bg-card/40 p-4",
          "transition-colors hover:border-copper/50 hover:bg-card",
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
          <p className="text-xs text-muted-foreground">
            {file
              ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
              : "JPEG, PNG, or WebP"}
          </p>
        </div>
        <Upload
          className="h-4 w-4 shrink-0 text-muted-foreground"
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
