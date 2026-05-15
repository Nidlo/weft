"use client";

import type { MeasurementMmData } from "@/types/graphql";
import { usePreferencesStore } from "@/lib/stores/preferences";
import { formatMeasurement } from "@/lib/utils/measurement";

// Field labels follow the Ghana ladies-measurement-booth standard
// (Sprint 36 booth-coverage). Field keys stay snake_case so they line up
// with the backend FIELD_MAP output; display strings match the booth.
const FIELD_LABELS: Record<string, Record<string, string>> = {
  upper_body: {
    shoulder: "Shoulder",
    bust: "Bust",
    underbust: "Under breast waist",
    waist: "Waist",
    neck: "Neck",
    across_back: "Across Back",
    across_chest: "Across Chest",
    nipple_to_nipple: "Nipple to Nipple",
    arm_length: "Sleeve length",
    bicep: "Around Arm",
    around_arm_3_4: "Around Arm 3/4",
    wrist: "Wrist",
    back_length: "Nape to Waist",
  },
  lower_body: {
    hips: "Hip",
    hip_depth: "Hip Depth",
    thigh: "Thigh",
    inseam: "Inseam",
    outseam: "Outseam",
    knee: "Knee",
    ankle: "Ankle",
  },
  vertical: {
    full_height: "Full Height",
    shoulder_to_nipple: "Shoulder to Nipple",
    shoulder_to_underbust: "Shoulder to Underbust",
    shoulder_to_waist: "Shoulder to Waist",
    shoulder_to_hip: "Shoulder to Hip",
    waist_to_knee: "Waist to Knee",
    waist_to_floor: "Waist to Floor",
  },
  // Garment-length fields. NOT measured by the AI - these are style
  // choices the customer/designer fills in. The manual form pre-fills
  // sensible defaults per garment template (e.g. Kaba → kaba_length 110).
  garments: {
    blouse_length: "Blouse length",
    kaba_length: "Kaba length",
    skirt_length: "Skirt length",
    slit_length: "Slit length",
    dress_length: "Dress length",
    cape: "Cape",
  },
};

const SECTION_LABELS: Record<string, string> = {
  upper_body: "Upper Body",
  lower_body: "Lower Body",
  vertical: "Vertical",
  garments: "Garment lengths",
};

interface MeasurementSummaryProps {
  /** Canonical mm-integer payload - the only persisted measurement values post-S1c. */
  dataMm: MeasurementMmData;
  /** Sparse mm-integer map of fields the user/designer manually corrected. */
  manualOverridesMm?: MeasurementMmData | null;
  /** Frozen mm-integer AI extraction. Used to render the baseline tooltip on overridden fields. */
  aiBaselineMm?: MeasurementMmData | null;
  compact?: boolean;
  /**
   * When provided, the ✏️ override badge becomes a clickable button that
   * calls back with the section + field. Page wires this to the reset
   * mutation. Omit on read-only surfaces (blueprint review, order pages).
   */
  onResetField?: (section: string, field: string) => void;
}

function readField(
  payload: MeasurementMmData | null | undefined,
  section: string,
  field: string
): number | null {
  if (!payload) return null;
  const sec = (payload as Record<string, Record<string, number | null>>)[
    section
  ];
  const v = sec?.[field];
  return v === undefined ? null : v;
}

function fieldIsOverridden(
  overrides: MeasurementMmData | null | undefined,
  section: string,
  field: string
): boolean {
  if (!overrides) return false;
  const sec = (overrides as Record<string, Record<string, number | null>>)[
    section
  ];
  return sec !== undefined && field in sec;
}

export function MeasurementSummary({
  dataMm,
  manualOverridesMm,
  aiBaselineMm,
  compact = false,
  onResetField,
}: MeasurementSummaryProps) {
  const sections = Object.entries(FIELD_LABELS);
  const displayUnit = usePreferencesStore((s) => s.measurementUnit);

  return (
    <div className={compact ? "space-y-2" : "space-y-4"}>
      {sections.map(([section, fields]) => {
        const hasValues = Object.entries(fields).some(
          ([field]) => readField(dataMm, section, field) !== null
        );

        if (!hasValues && compact) return null;

        return (
          <div key={section}>
            <h4
              className={`font-medium ${compact ? "text-muted-foreground text-xs" : "mb-2 text-sm"}`}
            >
              {SECTION_LABELS[section]}
            </h4>
            <div
              className={`grid gap-x-4 gap-y-1 ${compact ? "grid-cols-2 text-xs" : "grid-cols-2 text-sm sm:grid-cols-3"}`}
            >
              {Object.entries(fields).map(([field, label]) => {
                const value = readField(dataMm, section, field);
                const overridden = fieldIsOverridden(
                  manualOverridesMm,
                  section,
                  field
                );
                const baseline = readField(
                  aiBaselineMm ?? null,
                  section,
                  field
                );

                if (value === null) {
                  if (compact) return null;
                  return (
                    <div
                      key={field}
                      className="text-muted-foreground flex justify-between"
                    >
                      <span>{label}</span>
                      <span>-</span>
                    </div>
                  );
                }
                return (
                  <div key={field} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="flex items-center gap-1 font-medium">
                      {formatMeasurement(value, "mm", displayUnit)}
                      {overridden &&
                        (onResetField ? (
                          <button
                            type="button"
                            onClick={() => onResetField(section, field)}
                            aria-label={
                              baseline !== null
                                ? `Reset ${label} to AI baseline of ${formatMeasurement(baseline, "mm", displayUnit)}`
                                : `Reset ${label} to AI baseline`
                            }
                            title={
                              baseline !== null
                                ? `AI baseline: ${formatMeasurement(baseline, "mm", displayUnit)} (click to reset)`
                                : "Click to reset to AI baseline"
                            }
                            className="text-copper hover:text-foreground cursor-pointer text-[10px] leading-none"
                          >
                            ✏
                          </button>
                        ) : (
                          <span
                            aria-label={
                              baseline !== null
                                ? `Manually corrected - AI saw ${formatMeasurement(baseline, "mm", displayUnit)}`
                                : "Manually corrected"
                            }
                            title={
                              baseline !== null
                                ? `AI baseline: ${formatMeasurement(baseline, "mm", displayUnit)}`
                                : "Manually corrected"
                            }
                            className="text-copper text-[10px] leading-none"
                          >
                            ✏
                          </span>
                        ))}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { FIELD_LABELS, SECTION_LABELS };
