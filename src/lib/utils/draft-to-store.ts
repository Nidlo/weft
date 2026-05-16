import type { BlueprintFields } from "@/lib/stores/blueprint";
import type { GqlBlueprintDraft } from "@/types/graphql";

/**
 * Hydrate the blueprint wizard's Zustand fields from an existing draft so
 * "Revise" reopens the wizard pre-filled instead of starting blank. Inverse
 * of buildBlueprint() in blueprint/page.tsx: blueprint JSON + the draft's
 * budget (pesewas) + proposedDeadline map back onto the form fields.
 *
 * Budgets are stored in pesewas on the draft but the wizard edits whole-GHS
 * strings, so divide by 100. Reference-image URLs are preserved (the draft
 * only keeps URLs; publicId/name aren't round-tripped because re-upload
 * isn't needed to keep an already-uploaded image).
 */
export function draftToStoreFields(
  draft: GqlBlueprintDraft
): Partial<BlueprintFields> {
  const bp = draft.blueprint ?? {};

  const fields: Partial<BlueprintFields> = {
    garmentType: bp.garment_type ?? "",
    garmentTypeOther: bp.garment_type_other ?? "",
    occasion: bp.occasion ?? "",
    designDetails: bp.design_details ?? {},
    additionalDetails: bp.additional_details ?? [],
    freeText: bp.free_text ?? "",
    referenceImages: (bp.reference_images ?? []).map((url) => ({
      url,
      publicId: "",
      name: "",
    })),
    fabricType: bp.fabric_type ?? "",
    fabricTypeOther: bp.fabric_type_other ?? "",
    fabricColour: bp.fabric_colour ?? "",
    fabricColourHex: bp.fabric_colour_hex ?? "",
    clientProvidingFabric: bp.client_providing_fabric ?? false,
    fabricNotes: bp.fabric_notes ?? "",
    notes: draft.revisions?.at(-1)?.message ?? "",
  };

  if (draft.budgetMin != null) {
    fields.budgetMin = String(draft.budgetMin / 100);
  }
  if (draft.budgetMax != null) {
    fields.budgetMax = String(draft.budgetMax / 100);
  }
  if (draft.proposedDeadline) {
    fields.deadline = draft.proposedDeadline;
  }

  return fields;
}
