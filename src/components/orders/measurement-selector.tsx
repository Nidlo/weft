"use client";

import { useClientMeasurements } from "@/lib/hooks/use-orders";
import type { GqlMeasurement } from "@/types/graphql";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Ruler } from "lucide-react";
import { usePreferencesStore } from "@/lib/stores/preferences";
import { formatMeasurement, unitLabel } from "@/lib/utils/measurement";
import { InlineMeasurementSheet } from "./inline-measurement-sheet";

interface MeasurementSelectorProps {
  clientId: string | null;
  /**
   * Phone of a walk-in / external client (when no clientId). Used by the
   * inline measurement sheet to park the new measurement against this
   * phone — AuthService::linkOrphansByPhone() rebinds at signup.
   */
  pendingClientPhone?: string | null;
  value: string | undefined;
  onChange: (measurementId: string | undefined) => void;
}

export function MeasurementSelector({
  clientId,
  pendingClientPhone = null,
  value,
  onChange,
}: MeasurementSelectorProps) {
  const { measurements, loading } = useClientMeasurements(clientId);
  const displayUnit = usePreferencesStore((s) => s.measurementUnit);

  const hasPhone = !!pendingClientPhone;

  // No client linked AND no walk-in phone — nothing to attach a
  // measurement to yet. Surface the rule, no inline sheet.
  if (!clientId && !hasPhone) {
    return (
      <div className="text-muted-foreground rounded-lg border border-dashed p-3 text-center text-sm">
        <Ruler className="mx-auto mb-1 h-4 w-4" />
        Add a client (or their phone for a walk-in) to attach measurements
      </div>
    );
  }

  if (clientId && loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  const formatSummary = (m: GqlMeasurement) => {
    const bust = m.dataMm?.upper_body?.bust ?? null;
    const waist = m.dataMm?.upper_body?.waist ?? null;
    const hips = m.dataMm?.lower_body?.hips ?? null;

    const parts: string[] = [];
    if (bust)
      parts.push(
        `Bust: ${formatMeasurement(bust, "mm", displayUnit, { withUnit: false })}`
      );
    if (waist)
      parts.push(
        `Waist: ${formatMeasurement(waist, "mm", displayUnit, { withUnit: false })}`
      );
    if (hips)
      parts.push(
        `Hips: ${formatMeasurement(hips, "mm", displayUnit, { withUnit: false })}`
      );
    return parts.length > 0
      ? parts.join(" · ") + ` ${unitLabel(displayUnit)}`
      : m.source;
  };

  const noSavedMeasurements = clientId && measurements.length === 0;

  return (
    <div className="space-y-2">
      <Label>Client Measurement Profile</Label>

      {/* In-system client with at least one saved measurement: standard
          select with an inline "+ Take new measurement" trigger underneath. */}
      {clientId && !noSavedMeasurements && (
        <Select
          value={value ?? "none"}
          onValueChange={(v) => onChange(v === "none" ? undefined : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select measurement profile..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No measurement</SelectItem>
            {measurements.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                <div className="flex flex-col">
                  <span>
                    {m.label}
                    {m.isDefault && " (Default)"}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {formatSummary(m)}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* In-system client with no measurements yet: skip the empty select
          and lead straight into the take-new affordance. */}
      {noSavedMeasurements && (
        <div className="text-muted-foreground rounded-lg border border-dashed p-3 text-center text-sm">
          <Ruler className="mx-auto mb-1 h-4 w-4" />
          No saved measurements yet
        </div>
      )}

      {/* Walk-in client (phone provided, no user_id): no list to show
          (the orphan rows are invisible until claim), so just surface
          the inline sheet trigger. */}
      {!clientId && hasPhone && (
        <div className="text-muted-foreground rounded-lg border border-dashed p-3 text-center text-sm">
          <Ruler className="mx-auto mb-1 h-4 w-4" />
          Take measurements now — they&apos;ll attach when the client signs up.
        </div>
      )}

      <InlineMeasurementSheet
        clientId={clientId}
        pendingClientPhone={pendingClientPhone}
        onSaved={(id) => onChange(id)}
      />
    </div>
  );
}
