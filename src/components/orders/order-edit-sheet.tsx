"use client";

import { useState } from "react";
import { useBlueprintOptions } from "@/lib/hooks/use-blueprint-options";
import { useUpdateOrder } from "@/lib/hooks/use-orders";
import { pesewasToGhs } from "@/lib/utils/order";
import type { GqlOrderDetail } from "@/types/graphql";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { GarmentTypeCombobox } from "./garment-type-combobox";
import { FabricTypeCombobox } from "./fabric-type-combobox";
import { AdditionalDetailsCombobox } from "./additional-details-combobox";
import { ReferenceImageUpload } from "./reference-image-upload";
import { MeasurementSelector } from "./measurement-selector";
import { BudgetInput } from "./budget-input";
import { VoiceInput } from "./voice-input";

interface OrderEditSheetProps {
  order: GqlOrderDetail;
  isDesigner: boolean;
  onSuccess: () => void;
}

export function OrderEditSheet({
  order,
  isDesigner,
  onSuccess,
}: OrderEditSheetProps) {
  const [open, setOpen] = useState(false);
  const { options } = useBlueprintOptions();
  const { updateOrder, loading: saving } = useUpdateOrder();

  // Editable state — initialized from order
  const [garmentType, setGarmentType] = useState("");
  const [fabricTypes, setFabricTypes] = useState<string[]>([]);
  const [additionalDetails, setAdditionalDetails] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [budgetMinGhs, setBudgetMinGhs] = useState("");
  const [budgetMaxGhs, setBudgetMaxGhs] = useState("");
  const [notes, setNotes] = useState("");
  const [measurementId, setMeasurementId] = useState<string | undefined>(
    undefined
  );
  // Track which (orderId, openCount) snapshot we've seeded the form from.
  // Setting state during render guarded by a transition flag is the React 19
  // way to reset form state when a prop changes — no effect required.
  const [seededFor, setSeededFor] = useState<string | null>(null);
  const seedKey = open ? `${order.id}` : null;

  if (open && seedKey !== seededFor) {
    setSeededFor(seedKey);
    const bp = order.blueprint as unknown as Record<string, unknown> | null;
    setGarmentType(order.blueprint?.garment_type ?? "");
    setFabricTypes((bp?.fabric_types as string[] | undefined) ?? []);
    setAdditionalDetails(
      (bp?.additional_details as string[] | undefined) ?? []
    );
    setDescription((bp?.description as string | undefined) ?? "");
    setReferenceImages((bp?.reference_images as string[] | undefined) ?? []);
    setBudgetMinGhs(pesewasToGhs(order.budgetMin));
    setBudgetMaxGhs(pesewasToGhs(order.budgetMax));
    setNotes(order.notes ?? "");
    setMeasurementId(order.measurementId ?? undefined);
  } else if (!open && seededFor !== null) {
    setSeededFor(null);
  }

  // Budget edits lock server-side once a confirmed price is set (designer
  // accepted, client may have paid). Send the budget fields only when the
  // server would actually accept them — otherwise an unrelated edit (e.g.
  // adding a fabric type after confirmation) gets rejected with "Pricing is
  // locked", because the server treats *presence* of budget keys as intent.
  const budgetLocked = order.confirmedPrice !== null;

  const handleSave = async () => {
    let budgetMin: number | undefined;
    let budgetMax: number | undefined;

    if (isDesigner && !budgetLocked) {
      budgetMin = Math.round(parseFloat(budgetMinGhs) * 100);
      budgetMax = Math.round(parseFloat(budgetMaxGhs) * 100);

      if (isNaN(budgetMin) || isNaN(budgetMax) || budgetMin > budgetMax) {
        toast.error("Invalid budget range.");
        return;
      }
    }

    const result = await updateOrder({
      orderId: order.id,
      ...(isDesigner && {
        garmentType: garmentType || undefined,
        ...(!budgetLocked && { budgetMin, budgetMax }),
        description: description.trim() || undefined,
        referenceImages:
          referenceImages.length > 0 ? referenceImages : undefined,
        fabricTypes: fabricTypes.length > 0 ? fabricTypes : undefined,
        additionalDetails:
          additionalDetails.length > 0 ? additionalDetails : undefined,
        measurementId: measurementId ?? undefined,
      }),
      notes: notes.trim() || undefined,
    });

    if (result) {
      toast.success("Order updated");
      setOpen(false);
      onSuccess();
    } else {
      toast.error("Failed to update order.");
    }
  };

  const handleVoiceTranscript = (text: string) => {
    setDescription((prev) => (prev ? prev + " " + text : text));
  };

  const isTerminal = ["delivered", "cancelled", "declined"].includes(
    order.status
  );
  if (isTerminal) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {/* Size matches the "Advance to <next stage>" luxe button it sits
            next to on the order detail page — used to be `size="sm"` which
            looked like a secondary chip. */}
        <Button variant="outline" size="lg" className="gap-1.5">
          <Pencil className="h-4 w-4" aria-hidden />
          Edit Order
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[90vh] w-full overflow-y-auto"
      >
        <SheetHeader className="px-4 sm:px-6">
          <SheetTitle>Edit Order</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6 px-4 pb-6 sm:px-6">
          {/* Designer-only fields */}
          {isDesigner && (
            <>
              {/* Garment Type */}
              <div className="space-y-2">
                <Label>Garment Type</Label>
                <GarmentTypeCombobox
                  options={options?.garmentTypes ?? []}
                  value={garmentType}
                  onChange={setGarmentType}
                />
              </div>

              {/* Fabric Types */}
              <div className="space-y-2">
                <Label>Fabric Types</Label>
                <FabricTypeCombobox
                  options={options?.fabricTypes ?? []}
                  selected={fabricTypes}
                  onChange={setFabricTypes}
                />
              </div>

              {/* Additional details (ruffles, pleats, embroidery...) */}
              <div className="space-y-2">
                <Label>Additional details</Label>
                <AdditionalDetailsCombobox
                  options={options?.designFields?.additional_detail ?? []}
                  selected={additionalDetails}
                  onChange={setAdditionalDetails}
                />
              </div>

              {/* Description + voice */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Description</Label>
                  <VoiceInput onTranscript={handleVoiceTranscript} />
                </div>
                <Textarea
                  placeholder="Describe the garment..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Reference Images */}
              <div className="space-y-2">
                <Label>Reference Images</Label>
                <ReferenceImageUpload
                  images={referenceImages}
                  onChange={setReferenceImages}
                />
              </div>

              {/* Budget — locked once a confirmed price exists. The
                  renegotiation path is the counter-offer flow on the
                  order detail page. */}
              {budgetLocked ? (
                <div className="border-border bg-muted/40 rounded-md border p-3 text-xs">
                  <p className="text-foreground font-medium">Budget locked</p>
                  <p className="text-muted-foreground mt-1">
                    Pricing is fixed at the confirmed price. To renegotiate,
                    send a counter-offer from the order detail page.
                  </p>
                </div>
              ) : (
                <BudgetInput
                  minGhs={budgetMinGhs}
                  maxGhs={budgetMaxGhs}
                  onMinChange={setBudgetMinGhs}
                  onMaxChange={setBudgetMaxGhs}
                />
              )}

              {/* Measurement — picks from the linked client's vault when
                  client_id is set, the walk-in's pending rows when only
                  client_phone is set, or the designer's own body vault
                  when neither (e.g. a prototype). Backend's
                  MeasurementAccessGuard validates the chosen id against
                  the post-update order state. */}
              <MeasurementSelector
                clientId={order.clientId}
                pendingClientPhone={order.clientId ? null : order.clientPhone}
                value={measurementId}
                onChange={setMeasurementId}
              />
            </>
          )}

          {/* Notes (both designer and client) */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Order instructions, special requirements..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Save */}
          <Button
            onClick={handleSave}
            loading={saving}
            loadingLabel="Saving..."
            className="w-full"
          >
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
