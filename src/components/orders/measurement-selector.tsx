"use client";

import { useClientMeasurements } from "@/lib/hooks/use-orders";
import { useMeasurements } from "@/lib/hooks/use-measurements";
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
  /**
   * The order's linked client (in-system user). When set, the selector
   * lists THAT client's measurements.
   */
  clientId: string | null;
  /**
   * Walk-in client's phone (E.164 or loose-Ghana-local). When set with
   * no `clientId`, the inline-take-new-measurement sheet parks new rows
   * against this phone for AuthService::linkOrphansByPhone() to claim
   * at signup.
   */
  pendingClientPhone?: string | null;
  /**
   * When BOTH clientId and pendingClientPhone are absent, the selector
   * falls into "designer's own body vault" mode - useful for samples,
   * prototypes, or drafts where the designer is the one being fitted.
   * The selector reads the authenticated designer's own measurements
   * via useMeasurements(). New rows save against the designer's
   * user_id (default createMeasurement path, no pendingClientPhone).
   *
   * Backend's MeasurementAccessGuard validates that the chosen
   * measurement matches the order's context - same legitimate paths
   * (own / linked client / pending phone), so picking a designer-self
   * measurement from this list is accepted on submit.
   */
  value: string | undefined;
  onChange: (measurementId: string | undefined) => void;
}

export function MeasurementSelector({
  clientId,
  pendingClientPhone = null,
  value,
  onChange,
}: MeasurementSelectorProps) {
  const hasPhone = !!pendingClientPhone;
  const isSelfMode = !clientId && !hasPhone;

  // Whichever path is active, load the right list. The two hooks are
  // cheap (Apollo cache-first on subsequent renders) and the inactive
  // one returns an empty array, so unconditional calls keep the hook
  // order stable across mode flips.
  const { measurements: clientMeasurements, loading: clientLoading } =
    useClientMeasurements(clientId);
  const { measurements: ownMeasurements, loading: ownLoading } =
    useMeasurements();

  const displayUnit = usePreferencesStore((s) => s.measurementUnit);

  const measurements = isSelfMode ? ownMeasurements : clientMeasurements;
  const loading = isSelfMode ? ownLoading : clientLoading;

  const headerLabel = isSelfMode
    ? "Your body vault"
    : "Client measurement profile";
  const emptyCopy = isSelfMode
    ? "No measurements in your body vault yet"
    : "No saved measurements yet";
  const selfModeHint =
    "No client linked. Pick from your own body vault, or take a new measurement just for this order.";

  if (clientId && clientLoading) {
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

  const hasMeasurements = measurements.length > 0;

  return (
    <div className="space-y-2">
      <Label>{headerLabel}</Label>

      {hasMeasurements && (
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

      {!hasMeasurements && (
        <div className="text-muted-foreground rounded-lg border border-dashed p-3 text-center text-sm">
          <Ruler className="mx-auto mb-1 h-4 w-4" />
          {loading ? "Loading measurements..." : emptyCopy}
        </div>
      )}

      {isSelfMode && hasMeasurements && (
        <p className="text-muted-foreground text-xs">{selfModeHint}</p>
      )}

      {hasPhone && !clientId && (
        <p className="text-muted-foreground text-xs">
          Take measurements now. They&apos;ll attach to the client when they
          sign up.
        </p>
      )}

      <InlineMeasurementSheet
        clientId={clientId}
        pendingClientPhone={pendingClientPhone}
        onSaved={(id) => onChange(id)}
      />
    </div>
  );
}
