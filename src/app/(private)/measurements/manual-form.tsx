"use client";

import { useState } from "react";
import { Check, Ruler } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MeasurementData } from "@/types/graphql";
import {
  FIELD_LABELS,
  SECTION_LABELS,
} from "@/components/shared/measurement-summary";
import { usePreferencesStore } from "@/lib/stores/preferences";
import {
  checkBounds,
  convertMeasurementData,
  unitLabel,
  unitName,
  type MeasurementUnit,
} from "@/lib/utils/measurement";
import { cn } from "@/lib/utils";

// Garment-template → list of measurement fields that actually matter for that
// garment. `all` (default) shows everything; pickers for everything else
// reduce visual noise so a tailor doesn't have to scroll past 20 fields to
// fill in 6.
export type MeasurementTemplate =
  | "all"
  | "kaba_slit"
  | "agbada"
  | "suit"
  | "wedding_dress"
  | "shirt"
  | "trousers";

const TEMPLATE_FIELDS: Record<Exclude<MeasurementTemplate, "all">, string[]> = {
  kaba_slit: [
    "bust",
    "underbust",
    "waist",
    "hips",
    "shoulder",
    "across_back",
    "across_chest",
    "nipple_to_nipple",
    "arm_length",
    "bicep",
    "around_arm_3_4",
    "wrist",
    "back_length",
    "full_height",
    "shoulder_to_nipple",
    "shoulder_to_underbust",
    "shoulder_to_waist",
    "shoulder_to_hip",
    "waist_to_knee",
    "waist_to_floor",
    "hip_depth",
    "blouse_length",
    "kaba_length",
    "skirt_length",
    "slit_length",
  ],
  agbada: [
    "shoulder",
    "bust",
    "arm_length",
    "neck",
    "back_length",
    "full_height",
    "shoulder_to_waist",
    "shoulder_to_hip",
    "waist_to_knee",
    "dress_length",
  ],
  suit: [
    "shoulder",
    "bust",
    "waist",
    "neck",
    "across_back",
    "across_chest",
    "arm_length",
    "bicep",
    "wrist",
    "hips",
    "inseam",
    "outseam",
    "full_height",
    "back_length",
    "shoulder_to_waist",
    "shoulder_to_hip",
  ],
  wedding_dress: [
    "bust",
    "underbust",
    "waist",
    "hips",
    "shoulder",
    "across_back",
    "across_chest",
    "nipple_to_nipple",
    "arm_length",
    "full_height",
    "shoulder_to_nipple",
    "shoulder_to_underbust",
    "shoulder_to_waist",
    "shoulder_to_hip",
    "waist_to_floor",
    "hip_depth",
    "dress_length",
    "cape",
  ],
  shirt: [
    "shoulder",
    "bust",
    "neck",
    "across_back",
    "across_chest",
    "arm_length",
    "bicep",
    "around_arm_3_4",
    "wrist",
    "back_length",
    "shoulder_to_waist",
    "blouse_length",
  ],
  trousers: [
    "waist",
    "hips",
    "hip_depth",
    "inseam",
    "outseam",
    "thigh",
    "knee",
    "ankle",
    "waist_to_knee",
    "waist_to_floor",
  ],
};

// Smart defaults for garment-length fields per template, in CM. Pre-fill
// the manual form so the user only adjusts; leaving these as null
// produces "-" in the response and forces the designer to chase the
// customer for a value. Defaults pulled from typical Ghana ladies-wear
// proportions on a 165-170cm wearer; users override as needed.
const GARMENT_LENGTH_DEFAULTS_CM: Partial<
  Record<MeasurementTemplate, Record<string, number>>
> = {
  kaba_slit: {
    blouse_length: 55,
    kaba_length: 110,
    skirt_length: 95,
    slit_length: 90,
  },
  wedding_dress: {
    dress_length: 145,
    cape: 80,
  },
  shirt: {
    blouse_length: 60,
  },
  agbada: {
    dress_length: 140,
  },
};

const TEMPLATE_LABELS: Record<MeasurementTemplate, string> = {
  all: "All measurements",
  kaba_slit: "Kaba & Slit",
  agbada: "Agbada",
  suit: "Suit",
  wedding_dress: "Wedding dress",
  shirt: "Shirt",
  trousers: "Trousers",
};

function isFieldInTemplate(
  template: MeasurementTemplate,
  field: string
): boolean {
  if (template === "all") return true;
  return TEMPLATE_FIELDS[template].includes(field);
}

interface ManualFormProps {
  initialLabel?: string;
  initialUnit?: string;
  initialData?: MeasurementData;
  initialTemplate?: MeasurementTemplate;
  onSave: (label: string, unit: string, data: MeasurementData) => Promise<void>;
  saving?: boolean;
  onCancel?: () => void;
  /**
   * Sprint 34 Phase A3 - field names the AI pipeline's anthropometric
   * sanity check flagged as outside the adult-population proportion
   * band. Render a "Low confidence - verify with tape" badge inline on
   * each matching field so the user knows which values to scrutinise
   * before saving. Field names match the keys in `FIELD_LABELS` (e.g.
   * `"waist"`, `"bicep"`).
   */
  lowConfidenceFields?: ReadonlySet<string>;
}

function isMeasurementUnit(value: string): value is MeasurementUnit {
  return value === "cm" || value === "inches";
}

export function ManualForm({
  initialLabel = "",
  initialUnit,
  initialData,
  initialTemplate = "all",
  onSave,
  saving = false,
  onCancel,
  lowConfidenceFields,
}: ManualFormProps) {
  const preferredUnit = usePreferencesStore((s) => s.measurementUnit);
  // Editing an existing profile keeps its stored unit so existing numeric
  // values aren't reinterpreted; new profiles default to the user's
  // preferred display unit.
  const startingUnit: MeasurementUnit =
    initialUnit && isMeasurementUnit(initialUnit) ? initialUnit : preferredUnit;

  const [label, setLabel] = useState(initialLabel);
  const [unit, setUnit] = useState<MeasurementUnit>(startingUnit);
  const [template, setTemplate] =
    useState<MeasurementTemplate>(initialTemplate);
  const [data, setData] = useState<MeasurementData>(() => {
    // Seed garment defaults from the starting template so the user sees
    // sensible pre-fills (Kaba 110cm, Wedding dress 145cm, ...) instead
    // of blank inputs. Stored values from `initialData` win over the
    // template defaults - never overwrite user-supplied numbers.
    const seed: MeasurementData = initialData ?? {
      upper_body: {},
      lower_body: {},
      vertical: {},
      garments: {},
    };
    if (
      initialTemplate !== "all" &&
      GARMENT_LENGTH_DEFAULTS_CM[initialTemplate]
    ) {
      const defaults = GARMENT_LENGTH_DEFAULTS_CM[initialTemplate]!;
      const existing = seed.garments ?? {};
      const merged: Record<string, number | null> = { ...existing };
      for (const [field, defaultCm] of Object.entries(defaults)) {
        if (merged[field] == null) {
          // Convert template default (cm) into the form's starting unit
          // so the displayed number matches the unit toggle.
          merged[field] =
            startingUnit === "cm"
              ? defaultCm
              : Math.round((defaultCm / 2.54) * 10) / 10;
        }
      }
      return { ...seed, garments: merged };
    }
    return seed;
  });

  const handleFieldChange = (
    section: keyof MeasurementData,
    field: string,
    value: string
  ) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value === "" ? null : parseFloat(value),
      },
    }));
  };

  const handleUnitToggle = () => {
    // Convert the data alongside the unit so the displayed number always
    // matches the displayed label (a cm value must not render next to an
    // "in" label).
    //
    // CRITICAL: the two setters are called independently with PURE
    // updaters. The previous version nested `setData` inside the
    // `setUnit` updater - an impure updater. React 19 double-invokes
    // state updaters in dev to surface exactly this kind of impurity, so
    // the nested `setData` was enqueued twice and the conversion
    // compounded: 39.8 in -> 101.1 cm -> 256.8 cm (x2.54 twice). Reading
    // `unit` from the render closure and keeping each updater
    // side-effect-free makes a double-invoke a harmless no-op.
    const next: MeasurementUnit = unit === "cm" ? "inches" : "cm";
    setData(
      (d) =>
        convertMeasurementData(
          d as Record<string, Record<string, number | null>>,
          unit,
          next
        ) as MeasurementData
    );
    setUnit(next);
  };

  const handleSubmit = async () => {
    if (!label.trim()) return;
    await onSave(label.trim(), unit, data);
  };

  return (
    <div className="space-y-7">
      <header>
        <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
          Measurements
        </p>
        <h1 className="text-display mt-2 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
          {initialLabel ? "Edit profile" : "New profile"}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Fill in the fields you know. Leave anything blank - designers can ask
          for the rest at fitting.
        </p>
      </header>

      {/* Profile basics */}
      <GlassCard variant="solid" className="space-y-5 p-5 sm:p-6">
        <div className="space-y-2">
          <Label htmlFor="label" className="text-sm">
            Profile name
          </Label>
          <Input
            id="label"
            placeholder="My body, formal wear, etc."
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={100}
            className="h-11"
          />
        </div>

        <div className="border-border bg-card/60 flex items-center justify-between gap-4 rounded-xl border px-4 py-3">
          <div>
            <Label htmlFor="unit-toggle" className="text-sm">
              Input unit
            </Label>
            <p className="text-muted-foreground text-xs tabular-nums">
              {unitName(unit)} · {unitLabel(unit)}
            </p>
          </div>
          <Switch
            id="unit-toggle"
            checked={unit === "inches"}
            onCheckedChange={handleUnitToggle}
            aria-label={`Switch input unit, currently ${unitName(unit)}`}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="template" className="text-sm">
            Garment template
          </Label>
          <Select
            value={template}
            onValueChange={(v) => setTemplate(v as MeasurementTemplate)}
          >
            <SelectTrigger id="template" className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(TEMPLATE_LABELS) as MeasurementTemplate[]).map(
                (key) => (
                  <SelectItem key={key} value={key}>
                    {TEMPLATE_LABELS[key]}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">
            Pick a template to focus on the fields that matter for that garment.
            Switch to &ldquo;All measurements&rdquo; any time to enter the full
            set.
          </p>
        </div>
      </GlassCard>

      {/* Measurement sections */}
      {(
        Object.entries(FIELD_LABELS) as [
          keyof MeasurementData,
          Record<string, string>,
        ][]
      ).map(([section, fields]) => {
        const visibleFields = Object.entries(fields).filter(([field]) =>
          isFieldInTemplate(template, field)
        );
        if (visibleFields.length === 0) return null;
        return (
          <section key={section}>
            <header className="mb-3 flex items-center gap-2">
              <span className="bg-secondary text-foreground flex size-7 items-center justify-center rounded-lg">
                <Ruler className="h-3.5 w-3.5" aria-hidden />
              </span>
              <h2 className="text-display text-lg font-semibold tracking-tight">
                {SECTION_LABELS[section]}
              </h2>
            </header>
            <GlassCard variant="solid" className="p-5 sm:p-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {visibleFields.map(([field, fieldLabel]) => {
                  const value =
                    data[section]?.[
                      field as keyof (typeof data)[typeof section]
                    ] ?? "";
                  const warning =
                    typeof value === "number"
                      ? checkBounds(field, value, unit)
                      : null;
                  const lowConfidence =
                    lowConfidenceFields?.has(field) ?? false;
                  return (
                    <div key={field} className="space-y-1.5">
                      <Label
                        htmlFor={`${section}-${field}`}
                        className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase"
                      >
                        <span>{fieldLabel}</span>
                        {lowConfidence && (
                          <span
                            className="bg-status-warning/15 text-status-warning rounded-full px-1.5 py-0.5 text-[9px] tracking-normal normal-case"
                            title="The AI's value for this field was outside the typical adult proportion range. Verify with a tape measure."
                          >
                            Low confidence
                          </span>
                        )}
                      </Label>
                      <Input
                        id={`${section}-${field}`}
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder={unitLabel(unit)}
                        value={value}
                        onChange={(e) =>
                          handleFieldChange(section, field, e.target.value)
                        }
                        className={cn(
                          "h-10 tabular-nums",
                          (warning || lowConfidence) &&
                            "border-status-warning focus-visible:ring-status-warning"
                        )}
                      />
                      {warning && (
                        <p className="text-status-warning-fg text-[10px] leading-tight">
                          {warning}
                        </p>
                      )}
                      {!warning && lowConfidence && (
                        <p className="text-status-warning-fg text-[10px] leading-tight">
                          Outside typical adult proportions - please verify with
                          a tape measure.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </section>
        );
      })}

      <div className="flex flex-col gap-2 pt-2 sm:flex-row-reverse">
        <Button
          variant="luxe"
          size="xl"
          className="gap-1.5 sm:flex-1"
          onClick={handleSubmit}
          disabled={saving || !label.trim()}
        >
          {saving ? (
            "Saving..."
          ) : (
            <>
              Save measurements
              <Check className="h-4 w-4" aria-hidden />
            </>
          )}
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
