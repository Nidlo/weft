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

interface MeasurementSelectorProps {
  clientId: string | null;
  value: string | undefined;
  onChange: (measurementId: string | undefined) => void;
}

export function MeasurementSelector({
  clientId,
  value,
  onChange,
}: MeasurementSelectorProps) {
  const { measurements, loading } = useClientMeasurements(clientId);

  if (!clientId) {
    return (
      <div className="rounded-lg border border-dashed p-3 text-center text-sm text-muted-foreground">
        <Ruler className="mx-auto mb-1 h-4 w-4" />
        Link a client to attach their measurements
      </div>
    );
  }

  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (measurements.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-3 text-center text-sm text-muted-foreground">
        <Ruler className="mx-auto mb-1 h-4 w-4" />
        This client has no saved measurements
      </div>
    );
  }

  const formatSummary = (m: GqlMeasurement) => {
    const parts: string[] = [];
    if (m.data?.upper_body?.bust) parts.push(`Bust: ${m.data.upper_body.bust}`);
    if (m.data?.upper_body?.waist)
      parts.push(`Waist: ${m.data.upper_body.waist}`);
    if (m.data?.lower_body?.hips) parts.push(`Hips: ${m.data.lower_body.hips}`);
    return parts.length > 0 ? parts.join(" · ") + ` ${m.unit}` : m.source;
  };

  return (
    <div className="space-y-2">
      <Label>Client Measurement Profile</Label>
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
                <span className="text-xs text-muted-foreground">
                  {formatSummary(m)}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
