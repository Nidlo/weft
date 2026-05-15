/**
 * Display unit — what the user sees and what the unit toggle flips between.
 * Storage layer can be richer (mm), but only cm and inches are meaningful
 * to humans, so the preferences store and toggle stay binary.
 */
export type MeasurementUnit = "cm" | "inches";

/**
 * Storage unit — what a measurement value can be stored as. Adds `mm`,
 * which is the canonical integer storage post-S1B. Pass into
 * `formatMeasurement` / `convertMeasurement` when rendering values from
 * `dataMm` / `aiBaselineMm` / `manualOverridesMm` GraphQL fields.
 */
export type StorageUnit = MeasurementUnit | "mm";

const CM_PER_INCH = 2.54;
const MM_PER_CM = 10;

export function cmToInches(cm: number): number {
  return cm / CM_PER_INCH;
}

export function inchesToCm(inches: number): number {
  return inches * CM_PER_INCH;
}

export function mmToCm(mm: number): number {
  return mm / MM_PER_CM;
}

export function cmToMm(cm: number): number {
  return Math.round(cm * MM_PER_CM);
}

export function mmToInches(mm: number): number {
  return cmToInches(mmToCm(mm));
}

export function inchesToMm(inches: number): number {
  return cmToMm(inchesToCm(inches));
}

export function convertMeasurement(
  value: number,
  from: StorageUnit,
  to: StorageUnit
): number {
  if (from === to) return value;
  // Canonicalise via cm so we don't proliferate pairwise branches.
  const cm =
    from === "cm"
      ? value
      : from === "inches"
        ? inchesToCm(value)
        : mmToCm(value);
  return to === "cm" ? cm : to === "inches" ? cmToInches(cm) : cmToMm(cm);
}

export function unitLabel(unit: MeasurementUnit): string {
  return unit === "cm" ? "cm" : "in";
}

export function unitName(unit: MeasurementUnit): string {
  return unit === "cm" ? "Centimeters" : "Inches";
}

export interface FormatOptions {
  digits?: number;
  withUnit?: boolean;
}

export function formatMeasurement(
  value: number | null | undefined,
  storedUnit: StorageUnit,
  displayUnit: MeasurementUnit,
  { digits, withUnit = true }: FormatOptions = {}
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const converted = convertMeasurement(value, storedUnit, displayUnit);
  const decimals = digits ?? 1;
  const rounded = converted.toFixed(decimals);
  return withUnit ? `${rounded} ${unitLabel(displayUnit)}` : rounded;
}

/**
 * Walk a `{section: {field: value | null}}` payload, converting every
 * leaf number from `from` to `to`. Preserves nulls and missing fields.
 * Used by the form when loading a stored `dataMm` payload (mm) into the
 * display unit the user has selected, and by any S3+ flow that needs to
 * re-display measurement payloads in a chosen unit.
 */
export function convertMeasurementData<
  T extends Record<
    string,
    Record<string, number | null | undefined> | undefined
  >,
>(
  payload: T | null | undefined,
  from: StorageUnit,
  to: StorageUnit
): Record<string, Record<string, number | null>> {
  if (!payload) return {};
  if (from === to) {
    const passthrough: Record<string, Record<string, number | null>> = {};
    for (const [section, fields] of Object.entries(payload)) {
      if (!fields) continue;
      const out: Record<string, number | null> = {};
      for (const [field, value] of Object.entries(fields)) {
        out[field] = value ?? null;
      }
      passthrough[section] = out;
    }
    return passthrough;
  }

  const result: Record<string, Record<string, number | null>> = {};
  for (const [section, fields] of Object.entries(payload)) {
    if (!fields) continue;
    const out: Record<string, number | null> = {};
    for (const [field, value] of Object.entries(fields)) {
      if (value === null || value === undefined || Number.isNaN(value)) {
        out[field] = null;
      } else {
        // Round inches/cm conversions to 1 decimal so users entering values
        // back into a cm/inch input field don't see "91.4400000004".
        const converted = convertMeasurement(value, from, to);
        out[field] =
          to === "mm" ? Math.round(converted) : Math.round(converted * 10) / 10;
      }
    }
    result[section] = out;
  }
  return result;
}

export const ADULT_BOUNDS_CM: Record<string, { min: number; max: number }> = {
  bust: { min: 60, max: 160 },
  waist: { min: 50, max: 160 },
  hips: { min: 60, max: 170 },
  shoulder: { min: 30, max: 60 },
  chest: { min: 60, max: 160 },
  underbust: { min: 50, max: 140 },
  neck: { min: 25, max: 55 },
  arm_length: { min: 40, max: 80 },
  bicep: { min: 18, max: 55 },
  around_arm_3_4: { min: 15, max: 50 },
  wrist: { min: 12, max: 25 },
  thigh: { min: 35, max: 90 },
  inseam: { min: 50, max: 95 },
  outseam: { min: 70, max: 120 },
  knee: { min: 25, max: 60 },
  calf: { min: 25, max: 60 },
  ankle: { min: 15, max: 35 },
  hip_depth: { min: 15, max: 50 },
  full_height: { min: 120, max: 220 },
  height: { min: 120, max: 220 },
  back_length: { min: 30, max: 70 },
  front_length: { min: 30, max: 70 },
  across_back: { min: 28, max: 50 },
  across_chest: { min: 25, max: 48 },
  nipple_to_nipple: { min: 14, max: 30 },
  shoulder_to_nipple: { min: 18, max: 35 },
  shoulder_to_underbust: { min: 25, max: 42 },
  shoulder_to_waist: { min: 30, max: 70 },
  shoulder_to_hip: { min: 40, max: 80 },
  waist_to_knee: { min: 40, max: 80 },
  waist_to_floor: { min: 70, max: 130 },
};

/**
 * Re-scan tier thresholds in mm. Mirrors the backend's
 * `MeasurementService::RESCAN_*_THRESHOLD_MM` constants — kept in sync
 * by hand because this is the single fact (≈ 0.5″ and ≈ 2″ from Snad's
 * brief). If the backend numbers move, update these too AND the
 * `compareDataMm` test fixtures.
 */
export const RESCAN_AUTO_THRESHOLD_MM = 13;
export const RESCAN_REJECT_THRESHOLD_MM = 51;

export type RescanTier = "auto" | "prompt" | "reject";

export function classifyRescanDelta(
  baselineMm: number | null,
  proposedMm: number | null
): RescanTier {
  if (baselineMm === null || proposedMm === null) return "prompt";
  const abs = Math.abs(proposedMm - baselineMm);
  if (abs < RESCAN_AUTO_THRESHOLD_MM) return "auto";
  if (abs < RESCAN_REJECT_THRESHOLD_MM) return "prompt";
  return "reject";
}

/**
 * S2.5d — Recompute distance-based measurement fields from corrected
 * MediaPipe landmark positions. Returns a sparse `MeasurementMmData`-shaped
 * map containing only the fields this helper handles.
 *
 * **Scale anchoring**: the helper computes a px-to-mm scale by taking the
 * baseline measurement's `vertical.full_height` (in mm) and dividing by
 * the current pixel distance from head landmarks to foot landmarks. This
 * means the scale stays consistent with the AI's original extraction —
 * dragging an arm landmark doesn't randomly change the global scale;
 * dragging the foot landmark DOES (because it's redefining where the
 * body ends in the photo).
 *
 * **Coverage**: ONLY distance-based fields. Circumferences (bust, waist,
 * hip) need depth from the silhouette/SMPL pipeline and stay
 * manual-edit-only post-S2.5d.
 *
 * Returns `{}` when the helper can't compute (missing landmarks, missing
 * baseline full_height, or zero pixel-height). Caller should merge
 * results over existing `data_mm`, not replace it.
 */
type LandmarkPoint = { x: number; y: number; visibility: number };
type LandmarkMap = Record<string, LandmarkPoint>;

function midpoint(a: LandmarkPoint, b: LandmarkPoint): LandmarkPoint {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    visibility: Math.min(a.visibility, b.visibility),
  };
}

function pointDistance(a: LandmarkPoint, b: LandmarkPoint): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function verticalDistance(a: LandmarkPoint, b: LandmarkPoint): number {
  return Math.abs(a.y - b.y);
}

export function recomputeFromLandmarks(
  landmarks: LandmarkMap | null | undefined,
  baselineDataMm:
    | Record<string, Record<string, number | null | undefined> | undefined>
    | null
    | undefined
): Record<string, Record<string, number>> {
  if (!landmarks || !baselineDataMm) return {};

  const baselineHeightMm =
    baselineDataMm.vertical?.full_height ??
    baselineDataMm.vertical?.height ??
    null;

  // Top-of-head proxy: midpoint of ears. Foot proxy: midpoint of
  // foot_index landmarks (fall back to ankle if foot_index absent).
  const leftEar = landmarks.left_ear;
  const rightEar = landmarks.right_ear;
  const leftFoot = landmarks.left_foot_index ?? landmarks.left_ankle;
  const rightFoot = landmarks.right_foot_index ?? landmarks.right_ankle;

  const result: Record<string, Record<string, number>> = {};

  if (
    typeof baselineHeightMm !== "number" ||
    !leftEar ||
    !rightEar ||
    !leftFoot ||
    !rightFoot
  ) {
    return result;
  }

  const headTop = midpoint(leftEar, rightEar);
  const footMid = midpoint(leftFoot, rightFoot);
  const pixelHeight = verticalDistance(headTop, footMid);
  if (pixelHeight <= 0) return result;

  const mmPerPx = baselineHeightMm / pixelHeight;

  // ── full_height ──────────────────────────────────────────────────
  // Always reflects the current head-to-foot pixel span. Dragging the
  // foot DOES change full_height — that's the intended semantic.
  result.vertical = { full_height: Math.round(pixelHeight * mmPerPx) };

  // ── shoulder ─────────────────────────────────────────────────────
  if (landmarks.left_shoulder && landmarks.right_shoulder) {
    const px = pointDistance(landmarks.left_shoulder, landmarks.right_shoulder);
    result.upper_body = {
      ...(result.upper_body ?? {}),
      shoulder: Math.round(px * mmPerPx),
    };
  }

  // ── arm_length (left, fall back to right) ────────────────────────
  const armSrc =
    (landmarks.left_shoulder && landmarks.left_wrist
      ? [landmarks.left_shoulder, landmarks.left_wrist]
      : null) ??
    (landmarks.right_shoulder && landmarks.right_wrist
      ? [landmarks.right_shoulder, landmarks.right_wrist]
      : null);
  if (armSrc) {
    const px = pointDistance(armSrc[0], armSrc[1]);
    result.upper_body = {
      ...(result.upper_body ?? {}),
      arm_length: Math.round(px * mmPerPx),
    };
  }

  // ── inseam (left hip → left ankle, fall back right) ─────────────
  const inseamSrc =
    (landmarks.left_hip && landmarks.left_ankle
      ? [landmarks.left_hip, landmarks.left_ankle]
      : null) ??
    (landmarks.right_hip && landmarks.right_ankle
      ? [landmarks.right_hip, landmarks.right_ankle]
      : null);
  if (inseamSrc) {
    const px = pointDistance(inseamSrc[0], inseamSrc[1]);
    result.lower_body = {
      ...(result.lower_body ?? {}),
      inseam: Math.round(px * mmPerPx),
    };
  }

  // ── shoulder_to_waist (vertical: shoulder-mid → hip-mid) ────────
  if (
    landmarks.left_shoulder &&
    landmarks.right_shoulder &&
    landmarks.left_hip &&
    landmarks.right_hip
  ) {
    const shoulderMid = midpoint(
      landmarks.left_shoulder,
      landmarks.right_shoulder
    );
    const hipMid = midpoint(landmarks.left_hip, landmarks.right_hip);
    const px = verticalDistance(shoulderMid, hipMid);
    result.vertical = {
      ...result.vertical,
      shoulder_to_waist: Math.round(px * mmPerPx),
    };
  }

  // ── waist_to_knee (vertical: hip-mid → knee-mid) ────────────────
  if (
    landmarks.left_hip &&
    landmarks.right_hip &&
    landmarks.left_knee &&
    landmarks.right_knee
  ) {
    const hipMid = midpoint(landmarks.left_hip, landmarks.right_hip);
    const kneeMid = midpoint(landmarks.left_knee, landmarks.right_knee);
    const px = verticalDistance(hipMid, kneeMid);
    result.vertical = {
      ...result.vertical,
      waist_to_knee: Math.round(px * mmPerPx),
    };
  }

  // ── waist_to_floor (vertical: hip-mid → foot-mid) ───────────────
  // Booth-coverage Sprint 36. Uses the same hip-mid + foot-mid we
  // already derived above for full_height — drag the foot and the
  // floor anchor moves with it.
  {
    const hipMid = midpoint(landmarks.left_hip, landmarks.right_hip);
    const px = verticalDistance(hipMid, footMid);
    if (px > 0) {
      result.vertical = {
        ...result.vertical,
        waist_to_floor: Math.round(px * mmPerPx),
      };
    }
  }

  // ── shoulder_to_hip (vertical: shoulder-mid → hip-mid) ─────────
  // Distinct from `shoulder_to_waist` above: the booth's
  // "Shoulder to Hip" is the longer vertical span used for full-length
  // bodice patterns (kaba, wedding gowns). Both update independently
  // when the user drags shoulder or hip landmarks.
  if (
    landmarks.left_shoulder &&
    landmarks.right_shoulder &&
    landmarks.left_hip &&
    landmarks.right_hip
  ) {
    const shoulderMid = midpoint(
      landmarks.left_shoulder,
      landmarks.right_shoulder
    );
    const hipMid = midpoint(landmarks.left_hip, landmarks.right_hip);
    const px = verticalDistance(shoulderMid, hipMid);
    // Booth's shoulder-to-hip lands ~5-8cm longer than shoulder-to-waist
    // because the hip-mid pose landmark sits at the iliac crest (lower
    // than the natural waist). The raw landmark distance IS the booth
    // measurement — don't add a correction here; if the user wanted
    // a custom offset, they'd edit the value manually.
    result.vertical = {
      ...result.vertical,
      shoulder_to_hip: Math.round(px * mmPerPx),
    };
  }

  // ── nape_to_waist (vertical: ear-mid → hip-mid) ────────────────
  // Approximation: C7 vertebra (the booth's "nape") sits within a few
  // mm of the ear's vertical position on a standing adult, so ear-mid
  // is the cleanest landmark proxy we have without a back photo. The
  // booth uses this for the back panel of a bodice (the "back_length"
  // field in the FE points at the same value).
  {
    const napeProxy = midpoint(leftEar, rightEar);
    const hipMid = midpoint(landmarks.left_hip, landmarks.right_hip);
    if (landmarks.left_hip && landmarks.right_hip) {
      const px = verticalDistance(napeProxy, hipMid);
      result.upper_body = {
        ...(result.upper_body ?? {}),
        back_length: Math.round(px * mmPerPx),
      };
    }
  }

  // ── across_back / across_chest (derived from shoulder width) ────
  // Front-photo-only approximation: across-chest/across-back are the
  // distances between the front/rear armhole points, ~5cm inside the
  // shoulder tips. Without a back photo we can't measure separately;
  // both default to standard ratios of the shoulder width. The user
  // sees them update live as they drag the shoulder landmarks.
  if (landmarks.left_shoulder && landmarks.right_shoulder) {
    const shoulderPx = pointDistance(
      landmarks.left_shoulder,
      landmarks.right_shoulder
    );
    const shoulderMm = shoulderPx * mmPerPx;
    result.upper_body = {
      ...(result.upper_body ?? {}),
      across_chest: Math.round(shoulderMm * 0.85),
      across_back: Math.round(shoulderMm * 0.9),
    };
  }

  return result;
}

export function checkBounds(
  field: string,
  value: number,
  unit: MeasurementUnit
): string | null {
  const bound = ADULT_BOUNDS_CM[field];
  if (!bound) return null;
  const cm = unit === "inches" ? inchesToCm(value) : value;
  if (cm < bound.min || cm > bound.max) {
    const minDisp =
      unit === "inches"
        ? cmToInches(bound.min).toFixed(1)
        : bound.min.toString();
    const maxDisp =
      unit === "inches"
        ? cmToInches(bound.max).toFixed(1)
        : bound.max.toString();
    return `Outside typical range (${minDisp}–${maxDisp} ${unitLabel(unit)}). Double-check before saving.`;
  }
  return null;
}
