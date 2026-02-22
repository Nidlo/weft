"use client";

import { useOnboardingStore } from "@/lib/stores/onboarding";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StepPricing() {
  const { pricingMin, pricingMax, setField } = useOnboardingStore();

  const formatCurrency = (value: string) => {
    const num = parseInt(value);
    if (isNaN(num)) return "";
    return `GHS ${num.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Pricing Range (optional)</Label>
        <p className="mt-1 text-sm text-muted-foreground">
          Set your typical price range in GHS. This helps clients filter by
          budget. You can always change this later.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pricingMin">Minimum (GHS)</Label>
          <Input
            id="pricingMin"
            type="number"
            placeholder="e.g. 50"
            value={pricingMin}
            onChange={(e) => setField("pricingMin", e.target.value)}
            min={0}
          />
          {pricingMin && (
            <p className="text-xs text-muted-foreground">
              {formatCurrency(pricingMin)}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="pricingMax">Maximum (GHS)</Label>
          <Input
            id="pricingMax"
            type="number"
            placeholder="e.g. 500"
            value={pricingMax}
            onChange={(e) => setField("pricingMax", e.target.value)}
            min={0}
          />
          {pricingMax && (
            <p className="text-xs text-muted-foreground">
              {formatCurrency(pricingMax)}
            </p>
          )}
        </div>
      </div>

      {pricingMin &&
        pricingMax &&
        parseInt(pricingMin) > parseInt(pricingMax) && (
          <p className="text-sm text-destructive">
            Minimum price cannot be higher than maximum price.
          </p>
        )}

      <div className="rounded-lg border border-border bg-muted/50 p-4">
        <p className="text-sm font-medium">Pricing tips</p>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>Set competitive prices based on your experience level</li>
          <li>Consider material costs when setting your range</li>
          <li>You can negotiate individual prices with each client</li>
        </ul>
      </div>
    </div>
  );
}
