"use client";

import { useState } from "react";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import {
  useMeasurements,
  useCreateMeasurement,
  useUpdateMeasurement,
  useDeleteMeasurement,
  useSetDefaultMeasurement,
} from "@/lib/hooks/use-measurements";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MeasurementSummary } from "@/components/shared/measurement-summary";
import { ManualForm } from "./manual-form";
import { AiFlow } from "./ai-flow";
import { toast } from "sonner";
import type { GqlMeasurement, MeasurementData } from "@/types/graphql";

type ViewMode = "list" | "manual" | "ai" | "edit";

export default function MeasurementsPage() {
  const { user, isReady } = useAuthGuard();
  const { measurements, loading, refetch } = useMeasurements();
  const { createMeasurement, loading: creating } = useCreateMeasurement();
  const { updateMeasurement, loading: updating } = useUpdateMeasurement();
  const { deleteMeasurement } = useDeleteMeasurement();
  const { setDefaultMeasurement } = useSetDefaultMeasurement();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!isReady || !user) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl px-4 py-8">
          <Skeleton className="mb-6 h-8 w-48" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </AppShell>
    );
  }

  const handleCreateManual = async (
    label: string,
    unit: string,
    data: MeasurementData
  ) => {
    try {
      await createMeasurement({ label, unit, data, source: "manual" });
      toast.success("Measurement profile saved!");
      setViewMode("list");
      refetch();
    } catch {
      toast.error("Failed to save measurement profile.");
    }
  };

  const handleCreateAi = async (
    label: string,
    unit: string,
    data: MeasurementData
  ) => {
    try {
      await createMeasurement({ label, unit, data, source: "ai_photo" });
      toast.success("AI measurement profile saved!");
      setViewMode("list");
      refetch();
    } catch {
      toast.error("Failed to save measurement profile.");
    }
  };

  const handleUpdate = async (
    label: string,
    unit: string,
    data: MeasurementData
  ) => {
    if (!editingId) return;
    try {
      await updateMeasurement(editingId, { label, unit, data });
      toast.success("Measurement profile updated!");
      setEditingId(null);
      setViewMode("list");
      refetch();
    } catch {
      toast.error("Failed to update measurement profile.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMeasurement(id);
      toast.success("Measurement profile deleted.");
      refetch();
    } catch {
      toast.error("Failed to delete measurement profile.");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultMeasurement(id);
      toast.success("Default measurement updated.");
      refetch();
    } catch {
      toast.error("Failed to set default measurement.");
    }
  };

  const editingMeasurement = editingId
    ? measurements.find((m) => m.id === editingId)
    : null;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Body Vault</h1>
            <p className="text-sm text-muted-foreground">
              {measurements.length} / 10 measurement profiles
            </p>
          </div>
          {viewMode === "list" && measurements.length < 10 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode("ai")}
              >
                AI Photo
              </Button>
              <Button size="sm" onClick={() => setViewMode("manual")}>
                Add Manual
              </Button>
            </div>
          )}
        </div>

        {viewMode === "manual" && (
          <ManualForm
            onSave={handleCreateManual}
            saving={creating}
            onCancel={() => setViewMode("list")}
          />
        )}

        {viewMode === "ai" && (
          <AiFlow
            onComplete={handleCreateAi}
            saving={creating}
            onCancel={() => setViewMode("list")}
          />
        )}

        {viewMode === "edit" && editingMeasurement && (
          <ManualForm
            initialLabel={editingMeasurement.label}
            initialUnit={editingMeasurement.unit}
            initialData={editingMeasurement.data}
            onSave={handleUpdate}
            saving={updating}
            onCancel={() => {
              setEditingId(null);
              setViewMode("list");
            }}
          />
        )}

        {viewMode === "list" && (
          <div className="space-y-4">
            {loading && (
              <>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </>
            )}

            {!loading && measurements.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center py-12">
                  <p className="text-muted-foreground">
                    No measurement profiles yet.
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add your first profile to get started with orders.
                  </p>
                </CardContent>
              </Card>
            )}

            {measurements.map((m: GqlMeasurement) => (
              <Card key={m.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{m.label}</CardTitle>
                      {m.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                      <Badge variant="outline">{m.source}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <MeasurementSummary data={m.data} unit={m.unit} compact />
                  <div className="mt-4 flex gap-2">
                    {!m.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(m.id)}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingId(m.id);
                        setViewMode("edit");
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(m.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
