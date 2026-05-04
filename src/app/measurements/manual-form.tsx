"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

// Reasonable adult body-measurement ranges in cm. Children's garments will
// trip these — they are warnings, not hard validation.
const BOUNDS_CM: Record<string, { min: number; max: number }> = {
  bust: { min: 60, max: 160 },
  waist: { min: 50, max: 160 },
  hips: { min: 60, max: 170 },
  shoulder: { min: 30, max: 60 },
  chest: { min: 60, max: 160 },
  neck: { min: 25, max: 55 },
  arm_length: { min: 40, max: 80 },
  bicep: { min: 18, max: 55 },
  wrist: { min: 12, max: 25 },
  thigh: { min: 35, max: 90 },
  inseam: { min: 50, max: 95 },
  outseam: { min: 70, max: 120 },
  knee: { min: 25, max: 60 },
  calf: { min: 25, max: 60 },
  ankle: { min: 15, max: 35 },
  height: { min: 120, max: 220 },
  back_length: { min: 30, max: 70 },
  front_length: { min: 30, max: 70 },
};

const CM_PER_INCH = 2.54;

function checkBounds(field: string, value: number, unit: string): string | null {
  const bound = BOUNDS_CM[field];
  if (!bound) return null;
  const cm = unit === "inches" ? value * CM_PER_INCH : value;
  if (cm < bound.min || cm > bound.max) {
    const minDisp = unit === "inches" ? (bound.min / CM_PER_INCH).toFixed(1) : bound.min;
    const maxDisp = unit === "inches" ? (bound.max / CM_PER_INCH).toFixed(1) : bound.max;
    return `Outside typical range (${minDisp}–${maxDisp} ${unit}). Double-check before saving.`;
  }
  return null;
}

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
    "waist",
    "hips",
    "shoulder",
    "arm_length",
    "full_height",
    "waist_to_knee",
    "waist_to_floor",
  ],
  agbada: [
    "shoulder",
    "bust",
    "arm_length",
    "neck",
    "full_height",
    "waist_to_knee",
  ],
  suit: [
    "shoulder",
    "bust",
    "waist",
    "neck",
    "arm_length",
    "bicep",
    "hips",
    "inseam",
    "outseam",
    "full_height",
  ],
  wedding_dress: [
    "bust",
    "underbust",
    "waist",
    "hips",
    "shoulder",
    "arm_length",
    "full_height",
    "waist_to_floor",
    "shoulder_to_waist",
  ],
  shirt: ["shoulder", "bust", "neck", "arm_length", "bicep", "wrist"],
  trousers: ["waist", "hips", "inseam", "outseam", "thigh", "knee", "ankle"],
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
  field: string,
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
}

export function ManualForm({
  initialLabel = "",
  initialUnit = "cm",
  initialData,
  initialTemplate = "all",
  onSave,
  saving = false,
  onCancel,
}: ManualFormProps) {
  const [label, setLabel] = useState(initialLabel);
  const [unit, setUnit] = useState(initialUnit);
  const [template, setTemplate] = useState<MeasurementTemplate>(initialTemplate);
  const [data, setData] = useState<MeasurementData>(
    initialData ?? { upper_body: {}, lower_body: {}, vertical: {} }
  );

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
    setUnit((prev) => (prev === "cm" ? "inches" : "cm"));
  };

  const handleSubmit = async () => {
    if (!label.trim()) return;
    await onSave(label.trim(), unit, data);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="label">Profile Name</Label>
        <Input
          id="label"
          placeholder="e.g. My Body, Formal Wear"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          maxLength={100}
        />
      </div>

      <div className="flex items-center gap-3">
        <Label htmlFor="unit-toggle">Unit: {unit}</Label>
        <Switch
          id="unit-toggle"
          checked={unit === "inches"}
          onCheckedChange={handleUnitToggle}
        />
        <span className="text-sm text-muted-foreground">
          {unit === "cm" ? "Centimeters" : "Inches"}
        </span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="template">Garment template</Label>
        <Select
          value={template}
          onValueChange={(v) => setTemplate(v as MeasurementTemplate)}
        >
          <SelectTrigger id="template">
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
        <p className="text-xs text-muted-foreground">
          Pick a template to focus on the fields that matter for that garment.
          Switch to &ldquo;All measurements&rdquo; any time to enter the full set.
        </p>
      </div>

      {(Object.entries(FIELD_LABELS) as [keyof MeasurementData, Record<string, string>][]).map(
        ([section, fields]) => {
          const visibleFields = Object.entries(fields).filter(([field]) =>
            isFieldInTemplate(template, field)
          );
          if (visibleFields.length === 0) return null;
          return (
            <div key={section} className="space-y-3">
              <h3 className="text-base font-semibold">
                {SECTION_LABELS[section]}
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {visibleFields.map(([field, fieldLabel]) => {
                  const value =
                    data[section]?.[field as keyof (typeof data)[typeof section]] ??
                    "";
                  const warning =
                    typeof value === "number"
                      ? checkBounds(field, value, unit)
                      : null;
                  return (
                    <div key={field} className="space-y-1">
                      <Label htmlFor={`${section}-${field}`} className="text-xs">
                        {fieldLabel}
                      </Label>
                      <Input
                        id={`${section}-${field}`}
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder={unit}
                        value={value}
                        onChange={(e) =>
                          handleFieldChange(section, field, e.target.value)
                        }
                        className={
                          warning
                            ? "border-status-warning focus-visible:ring-status-warning"
                            : undefined
                        }
                      />
                      {warning && (
                        <p className="text-[10px] leading-tight text-status-warning-fg">
                          {warning}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }
      )}

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={saving || !label.trim()}
        >
          {saving ? "Saving..." : "Save Measurements"}
        </Button>
      </div>
    </div>
  );
}
