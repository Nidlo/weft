"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlassCard } from "@/components/ui/glass-card";
import {
  FIELD_LABELS,
  SECTION_LABELS,
} from "@/components/shared/measurement-summary";
import {
  useSetOrderGarmentEase,
  useClearOrderGarmentEase,
} from "@/lib/hooks/use-orders";
import { usePreferencesStore } from "@/lib/stores/preferences";
import {
  formatMeasurement,
  unitLabel,
} from "@/lib/utils/measurement";
import { cn } from "@/lib/utils";
import type { GqlOrderGarmentEase } from "@/types/graphql";

interface GarmentEaseEditorProps {
  orderId: string;
  eases: GqlOrderGarmentEase[];
  /** When false, the editor renders the list as read-only (clients view of the order). */
  canEdit: boolean;
}

const SECTION_OPTIONS = Object.keys(SECTION_LABELS) as Array<
  keyof typeof SECTION_LABELS
>;

export function GarmentEaseEditor({
  orderId,
  eases,
  canEdit,
}: GarmentEaseEditorProps) {
  const displayUnit = usePreferencesStore((s) => s.measurementUnit);
  const { setOrderGarmentEase, loading: saving } = useSetOrderGarmentEase(orderId);
  const { clearOrderGarmentEase, loading: clearing } =
    useClearOrderGarmentEase(orderId);

  const [adding, setAdding] = useState(false);
  const [section, setSection] = useState<string>("upper_body");
  const [field, setField] = useState<string>("");
  const [delta, setDelta] = useState<string>("");
  const [note, setNote] = useState<string>("");

  // Field options scoped to the chosen section, minus fields that already
  // have an ease (so the upsert UX feels like a tidy add-only flow; to
  // adjust an existing entry the user clears + re-adds, or we surface an
  // edit chip per-row in a follow-up).
  const fieldOptions = useMemo(() => {
    const labelGroup =
      (FIELD_LABELS as Record<string, Record<string, string>>)[section] ?? {};
    const taken = new Set(
      eases.filter((e) => e.section === section).map((e) => e.field),
    );
    return Object.entries(labelGroup).filter(([f]) => !taken.has(f));
  }, [eases, section]);

  const reset = () => {
    setAdding(false);
    setField("");
    setDelta("");
    setNote("");
  };

  const handleAdd = async () => {
    if (!field) {
      toast.error("Pick a measurement field first.");
      return;
    }
    const parsed = parseFloat(delta);
    if (Number.isNaN(parsed) || parsed === 0) {
      toast.error("Enter a non-zero ease (use a negative number to take in).");
      return;
    }
    try {
      await setOrderGarmentEase({
        orderId,
        section,
        field,
        delta: parsed,
        unit: displayUnit,
        note: note.trim() || null,
      });
      toast.success("Ease saved.");
      reset();
    } catch {
      toast.error("Couldn't save the ease.");
    }
  };

  const handleClear = async (e: GqlOrderGarmentEase) => {
    try {
      await clearOrderGarmentEase(e.section, e.field);
      toast.success("Ease cleared.");
    } catch {
      toast.error("Couldn't clear the ease.");
    }
  };

  const fieldLabelFor = (s: string, f: string): string => {
    const group = (FIELD_LABELS as Record<string, Record<string, string>>)[s];
    return group?.[f] ?? f;
  };
  const sectionLabelFor = (s: string): string =>
    (SECTION_LABELS as Record<string, string>)[s] ?? s;

  return (
    <div className="space-y-4">
      {eases.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground">
          No eases set yet.{" "}
          {canEdit
            ? "Add the allowance you'd like to give for this garment."
            : "The designer hasn't added any allowances on this order."}
        </p>
      )}

      {eases.length > 0 && (
        <ul className="space-y-2">
          {eases.map((ease) => {
            const positive = ease.deltaMm > 0;
            return (
              <li
                key={ease.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/60 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {fieldLabelFor(ease.section, ease.field)}{" "}
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {sectionLabelFor(ease.section)}
                    </span>
                  </p>
                  {ease.note && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {ease.note}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold tabular-nums",
                      positive
                        ? "bg-status-success/15 text-status-success-fg"
                        : "bg-status-danger/15 text-status-danger-fg",
                    )}
                  >
                    {positive ? (
                      <Plus className="h-3.5 w-3.5" aria-hidden />
                    ) : (
                      <Minus className="h-3.5 w-3.5" aria-hidden />
                    )}
                    {formatMeasurement(
                      Math.abs(ease.deltaMm),
                      "mm",
                      displayUnit,
                      { withUnit: false },
                    )}
                    {" "}
                    {unitLabel(displayUnit)}
                  </span>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleClear(ease)}
                      disabled={clearing}
                      aria-label={`Remove ease on ${fieldLabelFor(ease.section, ease.field)}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {canEdit && !adding && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAdding(true)}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Add ease
        </Button>
      )}

      {canEdit && adding && (
        <GlassCard variant="solid" className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <p className="text-display text-sm font-semibold tracking-tight">
              New ease
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={reset}
              aria-label="Cancel new ease"
            >
              <X className="h-4 w-4" aria-hidden />
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ease-section" className="text-xs">
                Section
              </Label>
              <Select
                value={section}
                onValueChange={(v) => {
                  setSection(v);
                  setField("");
                }}
              >
                <SelectTrigger id="ease-section">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTION_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {SECTION_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ease-field" className="text-xs">
                Field
              </Label>
              <Select value={field} onValueChange={setField}>
                <SelectTrigger id="ease-field">
                  <SelectValue placeholder="Pick a field" />
                </SelectTrigger>
                <SelectContent>
                  {fieldOptions.length === 0 && (
                    <SelectItem value="__none__" disabled>
                      All fields in this section have eases
                    </SelectItem>
                  )}
                  {fieldOptions.map(([f, label]) => (
                    <SelectItem key={f} value={f}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ease-delta" className="text-xs">
              Delta in {unitLabel(displayUnit)} (negative to take in)
            </Label>
            <Input
              id="ease-delta"
              type="number"
              step={displayUnit === "inches" ? "0.25" : "0.5"}
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              placeholder={displayUnit === "inches" ? "e.g. 1" : "e.g. 2.5"}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ease-note" className="text-xs">
              Note (optional)
            </Label>
            <Textarea
              id="ease-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why this allowance? Visible to client."
              rows={2}
              maxLength={500}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={reset} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={saving || !field}>
              {saving ? "Saving..." : "Save ease"}
            </Button>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
