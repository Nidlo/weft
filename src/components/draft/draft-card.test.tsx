import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { DraftCard } from "./draft-card";
import type { GqlBlueprintDraft } from "@/types/graphql";

function makeDraft(
  overrides: Partial<GqlBlueprintDraft> = {}
): GqlBlueprintDraft {
  return {
    id: "d1",
    initiatorId: "c1",
    initiatorRole: "client",
    clientId: "c1",
    designerId: "u-designer",
    blueprint: {
      garment_type: "wedding_dress",
      occasion: "wedding",
      fabric_type: "lace",
    },
    budgetMin: 10000,
    budgetMax: 50000,
    proposedDeadline: null,
    status: "shared",
    currentTurn: "designer",
    convertedOrderId: null,
    createdAt: "2026-05-16T00:00:00Z",
    updatedAt: "2026-05-16T00:00:00Z",
    client: { id: "c1", fullName: "Ama Client" } as GqlBlueprintDraft["client"],
    designer: {
      id: "u-designer",
      fullName: "Kofi Designer",
    } as GqlBlueprintDraft["designer"],
    ...overrides,
  };
}

describe("DraftCard", () => {
  it("renders the garment, the other party, and the status", () => {
    render(<DraftCard draft={makeDraft()} viewAs="client" />);

    expect(screen.getByText(/wedding dress/i)).toBeInTheDocument();
    expect(screen.getByText(/Kofi Designer/)).toBeInTheDocument();
    expect(screen.getByText("Awaiting reply")).toBeInTheDocument();
  });

  it("shows the 'Your move' cue only when it is the viewer's turn", () => {
    const { rerender } = render(
      <DraftCard
        draft={makeDraft({ currentTurn: "designer" })}
        viewAs="designer"
      />
    );
    expect(screen.getByText(/Your move/i)).toBeInTheDocument();

    rerender(
      <DraftCard
        draft={makeDraft({ currentTurn: "designer" })}
        viewAs="client"
      />
    );
    expect(screen.queryByText(/Your move/i)).not.toBeInTheDocument();
  });

  it("labels a designer-originated draft as a pitch", () => {
    render(
      <DraftCard
        draft={makeDraft({ initiatorRole: "designer" })}
        viewAs="client"
      />
    );
    expect(screen.getByText(/designer pitch/i)).toBeInTheDocument();
  });
});
