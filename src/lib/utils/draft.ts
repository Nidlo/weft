import type { BlueprintDraftStatus, DraftParty } from "@/types/graphql";

/**
 * Display label + badge tone per draft status. Mirrors the shape of
 * order.ts getStatusConfig so DraftCard can reuse the Badge component the
 * same way OrderCard does.
 */
export function getDraftStatusConfig(status: BlueprintDraftStatus): {
  label: string;
  tone: "default" | "secondary" | "outline" | "destructive";
} {
  switch (status) {
    case "draft":
      return { label: "Draft", tone: "secondary" };
    case "shared":
      return { label: "Awaiting reply", tone: "default" };
    case "revised":
      return { label: "Revised", tone: "default" };
    case "accepted":
      return { label: "Accepted", tone: "outline" };
    case "converted":
      return { label: "Converted to order", tone: "outline" };
    case "withdrawn":
      return { label: "Withdrawn", tone: "destructive" };
    case "declined":
      return { label: "Declined", tone: "destructive" };
  }
}

/**
 * Whether `viewerParty` may act right now: the draft must be open and it
 * must be the viewer's turn. Accept/revise are turn-gated; the UI must
 * never offer an action the backend state machine would reject.
 */
export function viewerCanAct(
  status: BlueprintDraftStatus,
  currentTurn: DraftParty,
  viewerParty: DraftParty | null
): boolean {
  if (viewerParty === null) return false;
  if (!["draft", "shared", "revised"].includes(status)) return false;
  return currentTurn === viewerParty;
}

export function partyForViewer(
  draft: { clientId: string; designerId: string },
  userId: string | null | undefined
): DraftParty | null {
  if (!userId) return null;
  if (draft.clientId === userId) return "client";
  if (draft.designerId === userId) return "designer";
  return null;
}
