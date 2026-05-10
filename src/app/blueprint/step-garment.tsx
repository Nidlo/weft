"use client";

import { Sparkles } from "lucide-react";

import { useBlueprintStore } from "@/lib/stores/blueprint";
import { useBlueprintOptions } from "@/lib/hooks/use-blueprint-options";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function StepGarment() {
  const { garmentType, garmentTypeOther, occasion, setField } =
    useBlueprintStore();
  const { options, loading } = useBlueprintOptions();

  if (loading || !options) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div>
        <Label className="flex items-center gap-1.5 text-sm">
          What type of garment?
          <span className="text-copper" aria-label="required">
            *
          </span>
        </Label>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {options.garmentTypes.map((opt) => (
            <SelectableCard
              key={opt.value}
              label={opt.label}
              isSelected={garmentType === opt.value}
              onClick={() => setField("garmentType", opt.value)}
            />
          ))}
          <SelectableCard
            label="Other"
            isSelected={garmentType === "other"}
            onClick={() => setField("garmentType", "other")}
          />
        </div>
        {garmentType === "other" && (
          <Input
            className="mt-3 h-11"
            placeholder="Describe the garment type..."
            value={garmentTypeOther}
            onChange={(e) => setField("garmentTypeOther", e.target.value)}
            maxLength={100}
          />
        )}
      </div>

      <div>
        <Label className="flex items-center gap-1.5 text-sm">
          What&apos;s the occasion?
          <span className="text-copper" aria-label="required">
            *
          </span>
        </Label>
        <div className="mt-3 flex flex-wrap gap-2">
          {options.occasions.map((opt) => (
            <ChipPill
              key={opt.value}
              label={opt.label}
              isActive={occasion === opt.value}
              onClick={() => setField("occasion", opt.value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface SelectableCardProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

export function SelectableCard({
  label,
  isSelected,
  onClick,
}: SelectableCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "bg-card rounded-xl border p-3 text-left text-sm font-medium transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-(--shadow-1)",
        isSelected
          ? "border-foreground/30 bg-foreground/5 shadow-(--shadow-glow)"
          : "border-border hover:border-foreground/30"
      )}
    >
      {isSelected && (
        <Sparkles className="text-copper mb-1.5 h-3 w-3" aria-hidden />
      )}
      {label}
    </button>
  );
}

interface ChipPillProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function ChipPill({ label, isActive, onClick }: ChipPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium",
        "transition-all duration-200 hover:-translate-y-0.5",
        isActive
          ? "bg-foreground text-background shadow-(--shadow-2)"
          : "border-border bg-card hover:border-foreground/30 border"
      )}
    >
      {label}
    </button>
  );
}
