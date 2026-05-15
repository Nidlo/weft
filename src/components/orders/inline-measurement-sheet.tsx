"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { Ruler, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CREATE_MEASUREMENT } from "@/lib/graphql/mutations/measurement";
import { CLIENT_MEASUREMENTS } from "@/lib/graphql/queries/order";
import { ManualForm } from "@/app/(private)/measurements/manual-form";
import { AiFlow } from "@/app/(private)/measurements/ai-flow";
import type {
  Landmarks,
  MeasurementData,
  GqlMeasurement,
} from "@/types/graphql";

interface InlineMeasurementSheetProps {
  /**
   * The linked client's user_id, when the order is for an in-system client.
   * Mutually exclusive with `pendingClientPhone` - exactly one of the two
   * MUST be supplied or the sheet trigger is disabled.
   */
  clientId?: string | null;
  /**
   * Phone of a walk-in / external client who isn't yet a Nidlo user. The
   * measurement is parked against this phone and rebound to a real user_id
   * at signup by AuthService::linkOrphansByPhone(). E.164 expected
   * (matches the orders.client_phone format).
   */
  pendingClientPhone?: string | null;
  /**
   * Called with the saved measurement's id so the parent can auto-select
   * it on the order draft.
   */
  onSaved: (measurementId: string) => void;
  /**
   * Trigger label override (default: "+ Take new measurement"). The parent
   * picks the right copy for the context - e.g. "Try Fitscan" vs
   * "Add measurement".
   */
  triggerLabel?: string;
  triggerVariant?: React.ComponentProps<typeof Button>["variant"];
  triggerSize?: React.ComponentProps<typeof Button>["size"];
}

interface CreateMeasurementResult {
  createMeasurement: GqlMeasurement;
}

export function InlineMeasurementSheet({
  clientId = null,
  pendingClientPhone = null,
  onSaved,
  triggerLabel = "+ Take new measurement",
  triggerVariant = "luxe-outline",
  triggerSize = "sm",
}: InlineMeasurementSheetProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"manual" | "ai">("manual");

  // Both client-in-system and walk-in paths hit the same mutation -
  // `pendingClientPhone` flips the resolver between user-owned and orphan
  // creation. The CLIENT_MEASUREMENTS refetch keeps the parent
  // MeasurementSelector's list fresh for in-system clients; the orphan
  // path has no list to refetch (the row is invisible until claim).
  const [createMeasurement, { loading: saving }] =
    useMutation<CreateMeasurementResult>(CREATE_MEASUREMENT, {
      refetchQueries: clientId
        ? [{ query: CLIENT_MEASUREMENTS, variables: { clientId } }]
        : [],
    });

  // The trigger is only enabled when we know who the measurement belongs
  // to. Surfacing the rule inline (rather than hiding the button) keeps
  // designers aware of WHY they can't take a measurement yet - usually
  // they need to type the walk-in's phone first.
  const canTakeMeasurement = !!clientId || !!pendingClientPhone;

  const handleSave = async (
    label: string,
    unit: string,
    data: MeasurementData,
    extra: {
      source?: string;
      landmarks?: Landmarks | null;
      photoUrl?: string | null;
      photoPublicId?: string | null;
      photoDisk?: string | null;
    } = {}
  ) => {
    try {
      const { data: result } = await createMeasurement({
        variables: {
          input: {
            label,
            unit,
            data,
            source: extra.source ?? "manual",
            landmarks: extra.landmarks ?? null,
            photoUrl: extra.photoUrl ?? null,
            photoPublicId: extra.photoPublicId ?? null,
            photoDisk: extra.photoDisk ?? null,
            // Designer-only field on the resolver. Client callers passing
            // this will be rejected (CreateMeasurement.assertDesigner).
            pendingClientPhone: pendingClientPhone ?? undefined,
          },
        },
      });

      const created = result?.createMeasurement;
      if (created) {
        toast.success(
          pendingClientPhone
            ? "Measurement saved - it will attach when they sign up"
            : "Measurement saved"
        );
        onSaved(created.id);
        setOpen(false);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save measurement";
      toast.error(message);
    }
  };

  const handleManualSave = (
    label: string,
    unit: string,
    data: MeasurementData
  ) => handleSave(label, unit, data, { source: "manual" });

  const handleAiSave = (
    label: string,
    unit: string,
    data: MeasurementData,
    landmarks: Landmarks | null,
    photoUrl: string | null,
    photoPublicId: string | null,
    photoDisk: string | null
  ) =>
    handleSave(label, unit, data, {
      source: "ai_photo",
      landmarks,
      photoUrl,
      photoPublicId,
      photoDisk,
    });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant={triggerVariant}
          size={triggerSize}
          disabled={!canTakeMeasurement}
          title={
            canTakeMeasurement
              ? undefined
              : "Add the client (or their phone for a walk-in) first."
          }
        >
          <Ruler className="mr-1.5 h-4 w-4" aria-hidden />
          {triggerLabel}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[92vh] w-full overflow-y-auto px-4 pb-6 sm:px-6"
      >
        <SheetHeader className="px-0">
          <SheetTitle>Take a measurement</SheetTitle>
          <SheetDescription>
            {pendingClientPhone
              ? "We'll park this against the walk-in's phone and attach it when they sign up."
              : "Saved to this client's Body Vault."}
          </SheetDescription>
        </SheetHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "manual" | "ai")}
          className="mt-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="gap-1.5">
              <Ruler className="h-3.5 w-3.5" aria-hidden />
              Manual
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Fitscan AI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="mt-4">
            <ManualForm
              onSave={handleManualSave}
              saving={saving}
              onCancel={() => setOpen(false)}
            />
          </TabsContent>

          <TabsContent value="ai" className="mt-4">
            <AiFlow
              onComplete={handleAiSave}
              saving={saving}
              onCancel={() => setOpen(false)}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
