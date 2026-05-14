"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Camera,
  Pencil,
  Plus,
  Ruler,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import {
  useMeasurements,
  useCreateMeasurement,
  useUpdateMeasurement,
  useDeleteMeasurement,
  useSetDefaultMeasurement,
  useResetMeasurementField,
} from "@/lib/hooks/use-measurements";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import { MeasurementSummary } from "@/components/shared/measurement-summary";
import { LandmarkOverlay } from "@/components/measurements/landmark-overlay";
import { UnitToggle } from "@/components/shared/unit-toggle";
import { ManualForm } from "./manual-form";
import { AiFlow } from "./ai-flow";
import { RescanFlow } from "./rescan-flow";
import { cn } from "@/lib/utils";
import { usePreferencesStore } from "@/lib/stores/preferences";
import { convertMeasurementData } from "@/lib/utils/measurement";
import type {
  GqlMeasurement,
  Landmarks,
  MeasurementData,
} from "@/types/graphql";

type ViewMode = "list" | "manual" | "ai" | "edit" | "rescan";

const SOURCE_LABEL: Record<string, string> = {
  manual: "Manual",
  ai_photo: "Fitscan AI",
};

export default function MeasurementsPage() {
  const { user, isReady } = useAuthGuard();
  const { measurements, loading, refetch } = useMeasurements();
  const { createMeasurement, loading: creating } = useCreateMeasurement();
  const { updateMeasurement, loading: updating } = useUpdateMeasurement();
  const { deleteMeasurement } = useDeleteMeasurement();
  const { setDefaultMeasurement } = useSetDefaultMeasurement();
  const { resetMeasurementField } = useResetMeasurementField();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  // Sprint 36 — landmarks the user has dragged in the edit view since
  // opening it. null while the view is closed or untouched; an object
  // means "user has corrected; send these on save".
  const [editingLandmarks, setEditingLandmarks] = useState<Landmarks | null>(
    null
  );
  const preferredUnit = usePreferencesStore((s) => s.measurementUnit);

  if (!isReady || !user) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl space-y-6">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-5 w-72" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
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
    data: MeasurementData,
    landmarks: Landmarks | null,
    photoUrl: string | null,
    photoPublicId: string | null,
    photoDisk: string | null
  ) => {
    try {
      await createMeasurement({
        label,
        unit,
        data,
        source: "ai_photo",
        landmarks: landmarks ?? undefined,
        photoUrl: photoUrl ?? undefined,
        photoPublicId: photoPublicId ?? undefined,
        photoDisk: photoDisk ?? undefined,
      });
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
      await updateMeasurement(editingId, {
        label,
        unit,
        data,
        // Forward edited landmarks only when the user actually dragged
        // something. Omitting (undefined) preserves the row's existing
        // landmarks_normalized; sending the unchanged map would still
        // work but creates noisy snapshots downstream.
        ...(editingLandmarks !== null ? { landmarks: editingLandmarks } : {}),
      });
      toast.success("Measurement profile updated!");
      setEditingId(null);
      setEditingLandmarks(null);
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

  const handleResetField = async (
    measurementId: string,
    section: string,
    field: string
  ) => {
    try {
      await resetMeasurementField(measurementId, section, field);
      toast.success("Reset to AI baseline.");
      refetch();
    } catch {
      toast.error("Couldn't reset that field. Try again.");
    }
  };

  const editingMeasurement = editingId
    ? measurements.find((m) => m.id === editingId)
    : null;
  const inSubFlow = viewMode !== "list";

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-7">
        {inSubFlow ? (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setViewMode("list");
            }}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Body Vault
          </button>
        ) : null}

        {!inSubFlow && (
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-copper text-[11px] font-semibold tracking-[0.18em] uppercase">
                Fit
              </p>
              <h1 className="text-display mt-2 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
                Body Vault
              </h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                Save measurement profiles so designers can fit you faster on
                every order.
              </p>
              <p className="border-border bg-card text-muted-foreground mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase">
                <Ruler className="text-copper h-3 w-3" aria-hidden />
                <span className="text-foreground tabular-nums">
                  {measurements.length}
                </span>
                <span>/ 10 profiles</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
              <UnitToggle showLabel={false} />
              {measurements.length < 10 && (
                <>
                  <Button
                    variant="luxe-outline"
                    size="lg"
                    className="gap-1.5"
                    onClick={() => setViewMode("ai")}
                  >
                    <Camera className="h-4 w-4" aria-hidden />
                    Fitscan AI
                  </Button>
                  <Button
                    variant="luxe"
                    size="lg"
                    className="gap-1.5"
                    onClick={() => setViewMode("manual")}
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    Add manual
                  </Button>
                </>
              )}
            </div>
          </header>
        )}

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

        {viewMode === "edit" &&
          editingMeasurement &&
          (() => {
            // Storage is canonical mm post-S1c. Convert into the user's
            // preferred unit for the form's number inputs so the values
            // round cleanly to 1 decimal.
            const formInitialData = convertMeasurementData(
              editingMeasurement.dataMm,
              "mm",
              preferredUnit
            ) as MeasurementData;
            // Sprint 36 — when the user opened the edit view we keep the
            // saved landmark map as the starting state; drag callbacks
            // overwrite it via `setEditingLandmarks`. Reading directly
            // from `editingMeasurement.landmarksNormalized` for the
            // photo render works while the user hasn't dragged anything;
            // once they drag, the overlay re-renders from the local
            // `editingLandmarks` state so dots track the pointer.
            const overlayLandmarks =
              editingLandmarks ??
              editingMeasurement.landmarksNormalized ??
              null;
            return (
              <div className="space-y-7">
                {editingMeasurement.photoUrl && overlayLandmarks && (
                  <LandmarkOverlay
                    photo={editingMeasurement.photoUrl}
                    landmarks={overlayLandmarks}
                    editable
                    onLandmarksChange={setEditingLandmarks}
                  />
                )}
                <ManualForm
                  initialLabel={editingMeasurement.label}
                  initialUnit={preferredUnit}
                  initialData={formInitialData}
                  onSave={handleUpdate}
                  saving={updating}
                  onCancel={() => {
                    setEditingId(null);
                    setEditingLandmarks(null);
                    setViewMode("list");
                  }}
                />
              </div>
            );
          })()}

        {viewMode === "rescan" && editingMeasurement && (
          <RescanFlow
            measurement={editingMeasurement}
            onComplete={() => {
              setEditingId(null);
              setViewMode("list");
              refetch();
            }}
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
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </>
            )}

            {!loading && measurements.length === 0 && (
              <GlassCard
                variant="solid"
                className="flex flex-col items-center py-16 text-center"
              >
                <span className="bg-secondary text-foreground flex size-16 items-center justify-center rounded-2xl">
                  <Sparkles className="text-copper h-7 w-7" aria-hidden />
                </span>
                <h2 className="text-display mt-5 text-2xl font-semibold tracking-tight">
                  No measurement profiles yet.
                </h2>
                <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm">
                  Add your first profile so designers know exactly how to cut
                  your garments.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <Button
                    variant="luxe-outline"
                    size="lg"
                    className="gap-1.5"
                    onClick={() => setViewMode("ai")}
                  >
                    <Camera className="h-4 w-4" aria-hidden />
                    Try Fitscan AI
                  </Button>
                  <Button
                    variant="luxe"
                    size="lg"
                    className="gap-1.5"
                    onClick={() => setViewMode("manual")}
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    Add manual
                  </Button>
                </div>
              </GlassCard>
            )}

            {measurements.map((m: GqlMeasurement) => (
              <GlassCard
                key={m.id}
                variant="solid"
                className="space-y-4 p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-display text-lg font-semibold tracking-tight">
                        {m.label}
                      </h3>
                      {m.isDefault && (
                        <span className="bg-copper/15 text-copper-soft ring-copper/30 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ring-1">
                          <Star className="fill-copper h-3 w-3" aria-hidden />
                          Default
                        </span>
                      )}
                      <span
                        className={cn(
                          "border-border bg-card/60 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase",
                          m.source === "ai_photo"
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {m.source === "ai_photo" && (
                          <Sparkles
                            className="text-copper h-3 w-3"
                            aria-hidden
                          />
                        )}
                        {SOURCE_LABEL[m.source] ?? m.source}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs tabular-nums">
                      Saved{" "}
                      {new Date(m.createdAt).toLocaleDateString("en-GH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <MeasurementSummary
                  dataMm={m.dataMm}
                  manualOverridesMm={m.manualOverridesMm}
                  aiBaselineMm={m.aiBaselineMm}
                  compact
                  onResetField={(section, field) =>
                    handleResetField(m.id, section, field)
                  }
                />

                {/* S2.5c — saved photo + landmark overlay (read-only) on
                    revisits. Renders only when both the ImageKit URL and
                    the corrected landmark coordinates are present. */}
                {m.photoUrl && m.landmarksNormalized && (
                  <LandmarkOverlay
                    photo={m.photoUrl}
                    landmarks={m.landmarksNormalized}
                    className="mt-3 max-w-[240px]"
                  />
                )}

                <div className="border-border/60 flex flex-wrap gap-2 border-t pt-3">
                  {!m.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground gap-1.5"
                      onClick={() => handleSetDefault(m.id)}
                    >
                      <Star className="h-3.5 w-3.5" aria-hidden />
                      Set default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground gap-1.5"
                    onClick={() => {
                      setEditingId(m.id);
                      setViewMode("edit");
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                    Edit
                  </Button>
                  {m.source === "ai_photo" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground gap-1.5"
                      onClick={() => {
                        setEditingId(m.id);
                        setViewMode("rescan");
                      }}
                    >
                      <Camera className="h-3.5 w-3.5" aria-hidden />
                      Re-scan
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:bg-status-error-soft hover:text-status-error-fg gap-1.5"
                    onClick={() => handleDelete(m.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Delete
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
