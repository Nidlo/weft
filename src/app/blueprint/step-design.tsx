"use client";

import { useBlueprintStore } from "@/lib/stores/blueprint";
import { useBlueprintOptions } from "@/lib/hooks/use-blueprint-options";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { BlueprintOption } from "@/types/graphql";
import { ChipPill, SelectableCard } from "./step-garment";

export function StepDesign() {
  const {
    garmentType,
    designDetails,
    additionalDetails,
    freeText,
    setField,
  } = useBlueprintStore();
  const { options, loading } = useBlueprintOptions();

  if (loading || !options) {
    return <Skeleton className="h-60 w-full" />;
  }

  // Get applicable field groups for this garment type
  const fieldGroups: string[] = options.garmentFields[garmentType] ?? [];

  const handleSingleSelect = (fieldGroup: string, value: string) => {
    setField("designDetails", { ...designDetails, [fieldGroup]: value });
  };

  const handleMultiSelect = (value: string) => {
    const current = additionalDetails;
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setField("additionalDetails", updated);
  };

  const formatGroupLabel = (group: string): string =>
    group.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="space-y-7">
      {fieldGroups
        .filter((g) => g !== "additional_detail")
        .map((fieldGroup) => {
          const groupOptions: BlueprintOption[] =
            options.designFields[fieldGroup] ?? [];
          const selectedValue =
            typeof designDetails[fieldGroup] === "string"
              ? (designDetails[fieldGroup] as string)
              : "";

          return (
            <div key={fieldGroup}>
              <Label className="text-sm">{formatGroupLabel(fieldGroup)}</Label>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {groupOptions.map((opt) => (
                  <SelectableCard
                    key={opt.value}
                    label={opt.label}
                    isSelected={selectedValue === opt.value}
                    onClick={() => handleSingleSelect(fieldGroup, opt.value)}
                  />
                ))}
              </div>
            </div>
          );
        })}

      {/* Additional details (multi-select) */}
      {fieldGroups.includes("additional_detail") && (
        <div>
          <Label className="text-sm">Additional details</Label>
          <div className="mt-3 flex flex-wrap gap-2">
            {(options.designFields["additional_detail"] ?? []).map((opt) => (
              <ChipPill
                key={opt.value}
                label={opt.label}
                isActive={additionalDetails.includes(opt.value)}
                onClick={() => handleMultiSelect(opt.value)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="free-text" className="text-sm">
          Additional notes <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="free-text"
          placeholder="Describe any other details about the design..."
          value={freeText}
          onChange={(e) => setField("freeText", e.target.value)}
          maxLength={500}
          rows={3}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground tabular-nums">
          {freeText.length} / 500 characters
        </p>
      </div>
    </div>
  );
}
