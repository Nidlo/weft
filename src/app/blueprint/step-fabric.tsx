"use client";

import { useBlueprintStore } from "@/lib/stores/blueprint";
import { useBlueprintOptions } from "@/lib/hooks/use-blueprint-options";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

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

  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-3 block text-base font-semibold">Fabric Type</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {options.fabricTypes.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setField("fabricType", opt.value)}
              className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                fabricType === opt.value
                  ? "border-primary bg-primary/5 font-medium"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setField("fabricType", "other")}
            className={`rounded-lg border p-3 text-left text-sm transition-colors ${
              fabricType === "other"
                ? "border-primary bg-primary/5 font-medium"
                : "border-border hover:border-primary/50"
            }`}
          >
            Other
          </button>
        </div>
        {fabricType === "other" && (
          <Input
            className="mt-3"
            placeholder="Describe the fabric type..."
            value={fabricTypeOther}
            onChange={(e) => setField("fabricTypeOther", e.target.value)}
            maxLength={100}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fabric-colour">Colour</Label>
          <Input
            id="fabric-colour"
            placeholder="e.g. Royal Blue"
            value={fabricColour}
            onChange={(e) => setField("fabricColour", e.target.value)}
            maxLength={50}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="colour-hex">Hex Code (optional)</Label>
          <div className="flex gap-2">
            <Input
              id="colour-hex"
              placeholder="#4169E1"
              value={fabricColourHex}
              onChange={(e) => setField("fabricColourHex", e.target.value)}
              maxLength={7}
            />
            {fabricColourHex && /^#[0-9A-Fa-f]{6}$/.test(fabricColourHex) && (
              <div
                className="h-9 w-9 shrink-0 rounded border"
                style={{ backgroundColor: fabricColourHex }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="providing-fabric"
          checked={clientProvidingFabric}
          onCheckedChange={(checked) =>
            setField("clientProvidingFabric", checked)
          }
        />
        <Label htmlFor="providing-fabric">I will provide the fabric</Label>
      </div>

      <div>
        <Label htmlFor="fabric-notes" className="mb-2 block">
          Fabric Notes (optional)
        </Label>
        <Textarea
          id="fabric-notes"
          placeholder="Any specific fabric preferences or notes..."
          value={fabricNotes}
          onChange={(e) => setField("fabricNotes", e.target.value)}
          maxLength={200}
          rows={2}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {fabricNotes.length} / 200 characters
        </p>
      </div>
    </div>
  );
}
