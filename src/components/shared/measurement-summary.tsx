"use client";

import type { MeasurementMmData } from "@/types/graphql";
import { usePreferencesStore } from "@/lib/stores/preferences";
import { formatMeasurement } from "@/lib/utils/measurement";

const FIELD_LABELS: Record<string, Record<string, string>> = {
  upper_body: {
    shoulder: "Shoulder",
    bust: "Bust / Chest",
    underbust: "Underbust",
    waist: "Waist",
    neck: "Neck",
    arm_length: "Arm Length",
    bicep: "Bicep",
    wrist: "Wrist",
  },
  lower_body: {
    hips: "Hips",
    thigh: "Thigh",
    inseam: "Inseam",
    outseam: "Outseam",
    knee: "Knee",
    ankle: "Ankle",
  },
  vertical: {
    full_height: "Full Height",
    shoulder_to_waist: "Shoulder to Waist",
    waist_to_knee: "Waist to Knee",
    waist_to_floor: "Waist to Floor",
  },
};

const SECTION_LABELS: Record<string, string> = {
  upper_body: "Upper Body",
  lower_body: "Lower Body",
  vertical: "Vertical",
};

interface MeasurementSummaryProps {
  /** Canonical mm-integer payload — the only persisted measurement values post-S1c. */
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
  field: string,
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
  field: string,
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
          ([field]) => readField(dataMm, section, field) !== null,
        );

        if (!hasValues && compact) return null;

        return (
          <div key={section}>
            <h4
              className={`font-medium ${compact ? "text-xs text-muted-foreground" : "text-sm mb-2"}`}
            >
              {SECTION_LABELS[section]}
            </h4>
            <div
              className={`grid gap-x-4 gap-y-1 ${compact ? "grid-cols-2 text-xs" : "grid-cols-2 sm:grid-cols-3 text-sm"}`}
            >
              {Object.entries(fields).map(([field, label]) => {
                const value = readField(dataMm, section, field);
                const overridden = fieldIsOverridden(
                  manualOverridesMm,
                  section,
                  field,
                );
                const baseline = readField(aiBaselineMm ?? null, section, field);

                if (value === null) {
                  if (compact) return null;
                  return (
                    <div
                      key={field}
                      className="flex justify-between text-muted-foreground"
                    >
                      <span>{label}</span>
                      <span>—</span>
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
                            className="cursor-pointer text-[10px] leading-none text-copper hover:text-foreground"
                          >
                            ✏
                          </button>
                        ) : (
                          <span
                            aria-label={
                              baseline !== null
                                ? `Manually corrected — AI saw ${formatMeasurement(baseline, "mm", displayUnit)}`
                                : "Manually corrected"
                            }
                            title={
                              baseline !== null
                                ? `AI baseline: ${formatMeasurement(baseline, "mm", displayUnit)}`
                                : "Manually corrected"
                            }
                            className="text-[10px] leading-none text-copper"
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
