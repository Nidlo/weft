"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BudgetInputProps {
  minGhs: string;
  maxGhs: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
}

export function BudgetInput({
  minGhs,
  maxGhs,
  onMinChange,
  onMaxChange,
}: BudgetInputProps) {
  const minVal = parseFloat(minGhs);
  const maxVal = parseFloat(maxGhs);
  const hasError =
    minGhs && maxGhs && !isNaN(minVal) && !isNaN(maxVal) && minVal > maxVal;

  return (
    <div className="space-y-2">
      <Label>
        Budget Range (GHS) <span className="text-destructive">*</span>
      </Label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Input
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            placeholder="Min e.g. 300"
            value={minGhs}
            onChange={(e) => onMinChange(e.target.value)}
          />
        </div>
        <div>
          <Input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Max e.g. 500"
            value={maxGhs}
            onChange={(e) => onMaxChange(e.target.value)}
          />
        </div>
      </div>
      {hasError && (
        <p className="text-destructive text-xs">
          Minimum cannot exceed maximum
        </p>
      )}
    </div>
  );
}
