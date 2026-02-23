"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { MeasurementData } from "@/types/graphql";
import {
  FIELD_LABELS,
  SECTION_LABELS,
} from "@/components/shared/measurement-summary";

interface ManualFormProps {
  initialLabel?: string;
  initialUnit?: string;
  initialData?: MeasurementData;
  onSave: (label: string, unit: string, data: MeasurementData) => Promise<void>;
  saving?: boolean;
  onCancel?: () => void;
}

export function ManualForm({
  initialLabel = "",
  initialUnit = "cm",
  initialData,
  onSave,
  saving = false,
  onCancel,
}: ManualFormProps) {
  const [label, setLabel] = useState(initialLabel);
  const [unit, setUnit] = useState(initialUnit);
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

      {(Object.entries(FIELD_LABELS) as [keyof MeasurementData, Record<string, string>][]).map(
        ([section, fields]) => (
          <div key={section} className="space-y-3">
            <h3 className="text-base font-semibold">
              {SECTION_LABELS[section]}
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Object.entries(fields).map(([field, fieldLabel]) => (
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
                    value={
                      data[section]?.[field as keyof (typeof data)[typeof section]] ??
                      ""
                    }
                    onChange={(e) =>
                      handleFieldChange(section, field, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )
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
