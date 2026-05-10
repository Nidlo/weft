"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, Minus, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  FIELD_LABELS,
  SECTION_LABELS,
} from "@/components/shared/measurement-summary";
import { usePreferencesStore } from "@/lib/stores/preferences";
import {
  classifyRescanDelta,
  formatMeasurement,
  unitLabel,
  type MeasurementUnit,
  type RescanTier,
} from "@/lib/utils/measurement";
import { cn } from "@/lib/utils";
import type { MeasurementMmData } from "@/types/graphql";

interface RescanDiffProps {
  /** Current canonical mm payload — what the profile is now. */
  baselineMm: MeasurementMmData;
  /** Newly proposed mm payload — typically derived from a fresh AI scan, then converted. */
  proposedMm: MeasurementMmData;
  /** Called with the section/field pairs the user has confirmed. Auto-tier rows always apply, reject-tier never. */
  onApply: (
    confirmedFields: Array<{ section: string; field: string }>
  ) => Promise<void> | void;
  applying?: boolean;
  onCancel?: () => void;
}

interface FieldRow {
  section: string;
  field: string;
  baselineMm: number | null;
  proposedMm: number | null;
  tier: RescanTier;
}

function readField(
  payload: MeasurementMmData | null | undefined,
  section: string,
  field: string
): number | null {
  if (!payload) return null;
  const sec = (payload as Record<string, Record<string, number | null>>)[
    section
  ];
  const v = sec?.[field];
  return v === undefined ? null : v;
}

function buildRows(
  baselineMm: MeasurementMmData,
  proposedMm: MeasurementMmData
): FieldRow[] {
  const rows: FieldRow[] = [];
  for (const [section, fields] of Object.entries(FIELD_LABELS)) {
    for (const field of Object.keys(fields)) {
      const base = readField(baselineMm, section, field);
      const prop = readField(proposedMm, section, field);
      if (base === prop) continue; // Unchanged — skip
      rows.push({
        section,
        field,
        baselineMm: base,
        proposedMm: prop,
        tier: classifyRescanDelta(base, prop),
      });
    }
  }
  return rows;
}

function tierBadge(tier: RescanTier, displayUnit: MeasurementUnit) {
  switch (tier) {
    case "auto":
      return (
        <span className="bg-status-success/15 text-status-success-fg inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
          <Check className="h-3 w-3" aria-hidden />
          Auto-applied
        </span>
      );
    case "prompt":
      return (
        <span className="bg-copper/15 text-copper-soft inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
          Confirm
        </span>
      );
    case "reject":
      return (
        <span
          className="bg-status-danger/15 text-status-danger-fg inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase"
          title={`Change is too large to trust automatically — likely an AI error. Re-scan or edit manually. (>= 2 ${unitLabel(displayUnit)})`}
        >
          <X className="h-3 w-3" aria-hidden />
          Rejected
        </span>
      );
  }
}

function deltaIcon(delta: number | null) {
  if (delta === null) return null;
  if (delta > 0)
    return <Plus className="text-status-success-fg h-3 w-3" aria-hidden />;
  if (delta < 0)
    return <Minus className="text-status-danger-fg h-3 w-3" aria-hidden />;
  return null;
}

export function RescanDiff({
  baselineMm,
  proposedMm,
  onApply,
  applying = false,
  onCancel,
}: RescanDiffProps) {
  const displayUnit = usePreferencesStore((s) => s.measurementUnit);
  const rows = useMemo(
    () => buildRows(baselineMm, proposedMm),
    [baselineMm, proposedMm]
  );

  // Confirmed prompt-tier fields keyed by `${section}.${field}`.
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});

  const promptRows = rows.filter((r) => r.tier === "prompt");
  const autoRows = rows.filter((r) => r.tier === "auto");
  const rejectRows = rows.filter((r) => r.tier === "reject");

  const noChanges = rows.length === 0;

  const handleApply = async () => {
    const confirmedFields = promptRows
      .filter((r) => confirmed[`${r.section}.${r.field}`])
      .map((r) => ({ section: r.section, field: r.field }));
    await onApply(confirmedFields);
  };

  const toggleConfirm = (section: string, field: string) => {
    const key = `${section}.${field}`;
    setConfirmed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (noChanges) {
    return (
      <div className="space-y-4">
        <div className="border-border bg-card rounded-2xl border p-6 text-center">
          <p className="text-display text-base font-semibold tracking-tight">
            No changes detected.
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            The new scan matches your saved measurements within tolerance.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Done
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
          Re-scan diff
        </p>
        <h2 className="text-display text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
          Review your changes
        </h2>
        <p className="text-muted-foreground text-sm">
          {autoRows.length > 0 && `${autoRows.length} auto-applied · `}
          {promptRows.length > 0 && `${promptRows.length} need confirm · `}
          {rejectRows.length > 0 && `${rejectRows.length} rejected · `}
          <span className="tabular-nums">{rows.length} total</span>
        </p>
      </div>

      <div className="border-border bg-card overflow-hidden rounded-2xl border">
        <table className="w-full text-sm">
          <thead className="border-border bg-card/80 border-b">
            <tr className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
              <th className="px-4 py-2.5 text-left">Field</th>
              <th className="px-4 py-2.5 text-right">Baseline</th>
              <th className="px-4 py-2.5"></th>
              <th className="px-4 py-2.5 text-right">New</th>
              <th className="px-4 py-2.5 text-right">Δ</th>
              <th className="px-4 py-2.5 text-center">Status</th>
              <th className="px-4 py-2.5 text-center">Confirm</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {rows.map((row) => {
              const labelGroup =
                FIELD_LABELS[row.section as keyof typeof FIELD_LABELS];
              const fieldLabel =
                (labelGroup as Record<string, string>)?.[row.field] ??
                row.field;
              const sectionLabel =
                (SECTION_LABELS as Record<string, string>)[row.section] ??
                row.section;
              const delta =
                row.baselineMm !== null && row.proposedMm !== null
                  ? row.proposedMm - row.baselineMm
                  : null;
              const key = `${row.section}.${row.field}`;
              return (
                <tr
                  key={key}
                  className={cn(
                    "transition-colors",
                    row.tier === "reject" && "bg-status-danger/5"
                  )}
                >
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{fieldLabel}</div>
                    <div className="text-muted-foreground text-[10px] tracking-wider uppercase">
                      {sectionLabel}
                    </div>
                  </td>
                  <td className="text-muted-foreground px-4 py-2.5 text-right tabular-nums">
                    {formatMeasurement(row.baselineMm, "mm", displayUnit)}
                  </td>
                  <td className="text-muted-foreground px-4 py-2.5 text-center">
                    <ArrowRight className="mx-auto h-3 w-3" aria-hidden />
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                    {formatMeasurement(row.proposedMm, "mm", displayUnit)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs tabular-nums">
                    {delta !== null && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5",
                          delta > 0 && "text-status-success-fg",
                          delta < 0 && "text-status-danger-fg"
                        )}
                      >
                        {deltaIcon(delta)}
                        {formatMeasurement(Math.abs(delta), "mm", displayUnit, {
                          withUnit: false,
                        })}{" "}
                        {unitLabel(displayUnit)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {tierBadge(row.tier, displayUnit)}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {row.tier === "prompt" ? (
                      <Checkbox
                        checked={!!confirmed[key]}
                        onCheckedChange={() =>
                          toggleConfirm(row.section, row.field)
                        }
                        aria-label={`Confirm ${fieldLabel} change`}
                      />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rejectRows.length > 0 && (
        <p className="text-status-danger-fg text-xs">
          Rejected fields will not apply — the change is too large for the AI to
          be trustworthy. Try a clearer photo or edit those fields manually.
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={applying}>
            Cancel
          </Button>
        )}
        <Button onClick={handleApply} disabled={applying}>
          {applying
            ? "Applying..."
            : promptRows.length > 0
              ? "Apply confirmed changes"
              : "Apply auto changes"}
        </Button>
      </div>

      {/* Hidden helper for screen readers in case the visual badges aren't read */}
      <Label className="sr-only" id="rescan-help">
        Tier badges in this table indicate which changes apply automatically,
        which need your confirmation, and which the system refuses because the
        change exceeds the trust threshold.
      </Label>
    </div>
  );
}
