"use client";

import { useBlueprintStore } from "@/lib/stores/blueprint";
import { useBlueprintOptions } from "@/lib/hooks/use-blueprint-options";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { BlueprintOption } from "@/types/graphql";

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
  const fieldGroups: string[] =
    options.garmentFields[garmentType] ?? [];

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
    group
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="space-y-6">
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
              <Label className="mb-3 block text-base font-semibold">
                {formatGroupLabel(fieldGroup)}
              </Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {groupOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSingleSelect(fieldGroup, opt.value)}
                    className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                      selectedValue === opt.value
                        ? "border-primary bg-primary/5 font-medium"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}

      {/* Additional Details (multi-select) */}
      {fieldGroups.includes("additional_detail") && (
        <div>
          <Label className="mb-3 block text-base font-semibold">
            Additional Details
          </Label>
          <div className="flex flex-wrap gap-2">
            {(options.designFields["additional_detail"] ?? []).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleMultiSelect(opt.value)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  additionalDetails.includes(opt.value)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="free-text" className="mb-2 block text-base font-semibold">
          Additional Notes (optional)
        </Label>
        <Textarea
          id="free-text"
          placeholder="Describe any other details about the design..."
          value={freeText}
          onChange={(e) => setField("freeText", e.target.value)}
          maxLength={500}
          rows={3}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {freeText.length} / 500 characters
        </p>
      </div>
    </div>
  );
}
