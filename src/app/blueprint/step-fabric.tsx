"use client";

import { useBlueprintStore } from "@/lib/stores/blueprint";
import { useBlueprintOptions } from "@/lib/hooks/use-blueprint-options";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import { SelectableCard } from "./step-garment";

export function StepFabric() {
  const {
    fabricType,
    fabricTypeOther,
    fabricColour,
    fabricColourHex,
    clientProvidingFabric,
    fabricNotes,
    setField,
  } = useBlueprintStore();
  const { options, loading } = useBlueprintOptions();

  if (loading || !options) {
    return <Skeleton className="h-40 w-full" />;
  }

  const validHex = /^#[0-9A-Fa-f]{6}$/.test(fabricColourHex);

  return (
    <div className="space-y-7">
      <div>
        <Label className="flex items-center gap-1.5 text-sm">
          Fabric type
          <span className="text-copper" aria-label="required">
            *
          </span>
        </Label>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {options.fabricTypes.map((opt) => (
            <SelectableCard
              key={opt.value}
              label={opt.label}
              isSelected={fabricType === opt.value}
              onClick={() => setField("fabricType", opt.value)}
            />
          ))}
          <SelectableCard
            label="Other"
            isSelected={fabricType === "other"}
            onClick={() => setField("fabricType", "other")}
          />
        </div>
        {fabricType === "other" && (
          <Input
            className="mt-3 h-11"
            placeholder="Describe the fabric type..."
            value={fabricTypeOther}
            onChange={(e) => setField("fabricTypeOther", e.target.value)}
            maxLength={100}
          />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fabric-colour" className="text-sm">
            Colour
          </Label>
          <Input
            id="fabric-colour"
            placeholder="e.g. Royal blue"
            value={fabricColour}
            onChange={(e) => setField("fabricColour", e.target.value)}
            maxLength={50}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="colour-hex" className="text-sm">
            Hex code <span className="text-muted-foreground">(optional)</span>
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="colour-hex"
              placeholder="#4169E1"
              value={fabricColourHex}
              onChange={(e) => setField("fabricColourHex", e.target.value)}
              maxLength={7}
              className="h-11 tabular-nums"
            />
            {validHex && (
              <div
                className="size-10 shrink-0 rounded-xl ring-1 ring-border"
                style={{ backgroundColor: fabricColourHex }}
                aria-label="Colour preview"
              />
            )}
          </div>
        </div>
      </div>

      <GlassCard
        variant="ghost"
        className="flex items-center justify-between gap-4 p-4"
      >
        <div>
          <Label htmlFor="providing-fabric" className="cursor-pointer text-sm">
            I will provide the fabric
          </Label>
          <p className="text-xs text-muted-foreground">
            The designer won&apos;t source fabric for this order.
          </p>
        </div>
        <Switch
          id="providing-fabric"
          checked={clientProvidingFabric}
          onCheckedChange={(checked) =>
            setField("clientProvidingFabric", checked)
          }
        />
      </GlassCard>

      <div className="space-y-2">
        <Label htmlFor="fabric-notes" className="text-sm">
          Fabric notes <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="fabric-notes"
          placeholder="Any specific fabric preferences or notes..."
          value={fabricNotes}
          onChange={(e) => setField("fabricNotes", e.target.value)}
          maxLength={200}
          rows={2}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground tabular-nums">
          {fabricNotes.length} / 200 characters
        </p>
      </div>
    </div>
  );
}
