import { describe, it, expect } from "vitest";

import { draftToStoreFields } from "./draft-to-store";
import type { GqlBlueprintDraft } from "@/types/graphql";

function makeDraft(
  overrides: Partial<GqlBlueprintDraft> = {}
): GqlBlueprintDraft {
  return {
    id: "d1",
    initiatorId: "c1",
    initiatorRole: "client",
    clientId: "c1",
    designerId: "u1",
    blueprint: {
      garment_type: "wedding_dress",
      occasion: "wedding",
      design_details: { neckline: "v_neck", sleeve: ["long", "lace"] },
      additional_details: ["beading"],
      free_text: "A-line silhouette",
      reference_images: ["https://ik/snad/nidlo/testing/refs/1.jpg"],
      fabric_type: "lace",
      fabric_type_other: "",
      fabric_colour: "ivory",
      fabric_colour_hex: "#FFFFF0",
      client_providing_fabric: true,
      fabric_notes: "soft hand-feel",
    },
    budgetMin: 1500000,
    budgetMax: 5000000,
    proposedDeadline: "2026-08-01",
    status: "shared",
    currentTurn: "designer",
    convertedOrderId: null,
    createdAt: "2026-05-16T00:00:00Z",
    updatedAt: "2026-05-16T00:00:00Z",
    ...overrides,
  };
}

describe("draftToStoreFields", () => {
  it("maps every blueprint field back onto the wizard store", () => {
    const f = draftToStoreFields(makeDraft());

    expect(f.garmentType).toBe("wedding_dress");
    expect(f.occasion).toBe("wedding");
    expect(f.designDetails).toEqual({
      neckline: "v_neck",
      sleeve: ["long", "lace"],
    });
    expect(f.additionalDetails).toEqual(["beading"]);
    expect(f.freeText).toBe("A-line silhouette");
    expect(f.fabricType).toBe("lace");
    expect(f.fabricColour).toBe("ivory");
    expect(f.fabricColourHex).toBe("#FFFFF0");
    expect(f.clientProvidingFabric).toBe(true);
    expect(f.fabricNotes).toBe("soft hand-feel");
  });

  it("converts pesewas budgets back to whole-GHS strings", () => {
    const f = draftToStoreFields(makeDraft());
    expect(f.budgetMin).toBe("15000");
    expect(f.budgetMax).toBe("50000");
  });

  it("preserves already-uploaded reference image URLs", () => {
    const f = draftToStoreFields(makeDraft());
    expect(f.referenceImages).toEqual([
      {
        url: "https://ik/snad/nidlo/testing/refs/1.jpg",
        publicId: "",
        name: "",
      },
    ]);
  });

  it("carries the proposed deadline through", () => {
    const f = draftToStoreFields(makeDraft());
    expect(f.deadline).toBe("2026-08-01");
  });

  it("seeds the notes field from the latest revision message", () => {
    const f = draftToStoreFields(
      makeDraft({
        revisions: [
          {
            id: "r1",
            authorId: "c1",
            authorRole: "client",
            blueprint: makeDraft().blueprint,
            budgetMin: null,
            budgetMax: null,
            proposedDeadline: null,
            message: "first pass",
            createdAt: "2026-05-16T00:00:00Z",
          },
          {
            id: "r2",
            authorId: "u1",
            authorRole: "designer",
            blueprint: makeDraft().blueprint,
            budgetMin: null,
            budgetMax: null,
            proposedDeadline: null,
            message: "tightened the bodice",
            createdAt: "2026-05-16T01:00:00Z",
          },
        ],
      })
    );
    expect(f.notes).toBe("tightened the bodice");
  });

  it("tolerates a sparse blueprint without throwing", () => {
    const f = draftToStoreFields(
      makeDraft({
        blueprint: {
          garment_type: "shirt",
          occasion: "casual",
          fabric_type: "cotton",
        },
        budgetMin: null,
        budgetMax: null,
        proposedDeadline: null,
      })
    );
    expect(f.garmentType).toBe("shirt");
    expect(f.designDetails).toEqual({});
    expect(f.additionalDetails).toEqual([]);
    expect(f.referenceImages).toEqual([]);
    expect(f.budgetMin).toBeUndefined();
    expect(f.deadline).toBeUndefined();
  });
});
