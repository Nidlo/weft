"use client";

import type { MeasurementData } from "@/types/graphql";

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
  data: MeasurementData;
  unit?: string;
  compact?: boolean;
}

export function MeasurementSummary({
  data,
  unit = "cm",
  compact = false,
}: MeasurementSummaryProps) {
  const sections = Object.entries(FIELD_LABELS);

  return (
    <div className={compact ? "space-y-2" : "space-y-4"}>
      {sections.map(([section, fields]) => {
        const sectionData =
          data[section as keyof MeasurementData] ?? {};
        const hasValues = Object.values(sectionData).some(
          (v) => v !== null && v !== undefined
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
                const value =
                  sectionData[field as keyof typeof sectionData];
                if (value === null || value === undefined) {
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
                    <span className="font-medium">
                      {value} {unit}
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
