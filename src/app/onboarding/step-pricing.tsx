"use client";

import { Coins, Lightbulb } from "lucide-react";

import { useOnboardingStore } from "@/lib/stores/onboarding";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";

export function StepPricing() {
  const { pricingMin, pricingMax, setField } = useOnboardingStore();

  const formatCurrency = (value: string) => {
    const num = parseInt(value);
    if (isNaN(num)) return "";
    return `GHS ${num.toLocaleString()}`;
  };

  const minNum = pricingMin ? parseInt(pricingMin) : null;
  const maxNum = pricingMax ? parseInt(pricingMax) : null;
  const isInverted =
    minNum !== null && maxNum !== null && minNum > maxNum;

  return (
    <div className="space-y-7">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
          <Coins className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <h2 className="text-display text-lg font-semibold tracking-tight">
            What&apos;s your typical price range?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Optional. Helps clients filter by budget — you can negotiate per
            order, and update this anytime.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="pricingMin" className="text-sm">
            Minimum
          </Label>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground"
              aria-hidden
            >
              GHS
            </span>
            <Input
              id="pricingMin"
              type="number"
              inputMode="decimal"
              placeholder="50"
              value={pricingMin}
              onChange={(e) => setField("pricingMin", e.target.value)}
              min={0}
              className="h-12 pl-12 text-base font-medium tabular-nums"
            />
          </div>
          {pricingMin && (
            <p className="text-xs text-muted-foreground">
              {formatCurrency(pricingMin)}
            </p>
          )}
        </div>

        <div
          className="hidden h-px w-full bg-linear-to-r from-transparent via-copper/60 to-transparent sm:block sm:h-12 sm:w-12 sm:bg-linear-to-b"
          aria-hidden
        />

        <div className="space-y-2">
          <Label htmlFor="pricingMax" className="text-sm">
            Maximum
          </Label>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground"
              aria-hidden
            >
              GHS
            </span>
            <Input
              id="pricingMax"
              type="number"
              inputMode="decimal"
              placeholder="500"
              value={pricingMax}
              onChange={(e) => setField("pricingMax", e.target.value)}
              min={0}
              className="h-12 pl-12 text-base font-medium tabular-nums"
            />
          </div>
          {pricingMax && (
            <p className="text-xs text-muted-foreground">
              {formatCurrency(pricingMax)}
            </p>
          )}
        </div>
      </div>

      {isInverted && (
        <p className="text-sm text-status-error">
          Minimum can&apos;t be higher than maximum.
        </p>
      )}

      <GlassCard variant="ghost" className="p-5">
        <div className="flex items-start gap-3">
          <Lightbulb
            className="mt-0.5 h-4 w-4 shrink-0 text-copper"
            aria-hidden
          />
          <div>
            <p className="text-sm font-medium">Pricing tips</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground marker:text-copper">
              <li>Set ranges based on your experience and material costs</li>
              <li>You can negotiate individual prices with each client</li>
              <li>Designers with public ranges get 2× more inquiries</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
