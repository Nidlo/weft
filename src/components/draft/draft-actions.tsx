"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  useAcceptBlueprintDraft,
  useConvertBlueprintDraft,
  useCloseBlueprintDraft,
} from "@/lib/hooks/use-blueprint-drafts";
import { viewerCanAct } from "@/lib/utils/draft";
import type { GqlBlueprintDraft, DraftParty } from "@/types/graphql";

interface DraftActionsProps {
  draft: GqlBlueprintDraft;
  viewerParty: DraftParty | null;
  onReviseClick: () => void;
  onChanged: () => void;
}

function friendlyError(err: unknown): string {
  const raw = err instanceof Error ? err.message.toLowerCase() : "";
  if (raw.includes("turn")) return "It is the other party's turn right now.";
  if (raw.includes("participant"))
    return "You are not a participant on this draft.";
  if (raw.includes("accepted"))
    return "This draft must be accepted before it can become an order.";
  if (raw.includes("yourself"))
    return "A draft cannot become an order with yourself on both sides.";
  if (raw.includes("network") || raw.includes("fetch"))
    return "We could not reach the server. Check your connection and try again.";
  return "Something went wrong. Please try again.";
}

export function DraftActions({
  draft,
  viewerParty,
  onReviseClick,
  onChanged,
}: DraftActionsProps) {
  const router = useRouter();
  const { acceptBlueprintDraft, loading: accepting } =
    useAcceptBlueprintDraft();
  const { convertBlueprintDraft, loading: converting } =
    useConvertBlueprintDraft();
  const { closeBlueprintDraft, loading: closing } = useCloseBlueprintDraft();
  const [busy, setBusy] = useState(false);

  const canAct = viewerCanAct(draft.status, draft.currentTurn, viewerParty);
  const isInitiator =
    viewerParty !== null && draft.initiatorRole === viewerParty;
  const isOpen = ["draft", "shared", "revised"].includes(draft.status);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      onChanged();
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const disabled = busy || accepting || converting || closing;

  if (draft.status === "converted" && draft.convertedOrderId) {
    return (
      <Button onClick={() => router.push(`/orders/${draft.convertedOrderId}`)}>
        View the order
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {canAct && (
        <>
          <Button onClick={onReviseClick} disabled={disabled}>
            Revise
          </Button>
          <Button
            variant="outline"
            disabled={disabled}
            onClick={() =>
              run(async () => {
                await acceptBlueprintDraft(draft.id);
                toast.success("Draft accepted.");
              })
            }
          >
            Accept this version
          </Button>
        </>
      )}

      {draft.status === "accepted" && viewerParty !== null && (
        <Button
          disabled={disabled}
          onClick={() =>
            run(async () => {
              const order = await convertBlueprintDraft(draft.id);
              if (order) {
                toast.success("Order created from this draft.");
                router.push(`/orders/${order.id}`);
              }
            })
          }
        >
          Convert to order
        </Button>
      )}

      {isOpen && isInitiator && (
        <Button
          variant="ghost"
          disabled={disabled}
          onClick={() =>
            run(async () => {
              await closeBlueprintDraft(draft.id, "withdraw");
              toast.success("Draft withdrawn.");
            })
          }
        >
          Withdraw
        </Button>
      )}

      {isOpen && !isInitiator && viewerParty !== null && (
        <Button
          variant="ghost"
          disabled={disabled}
          onClick={() =>
            run(async () => {
              await closeBlueprintDraft(draft.id, "decline");
              toast.success("Draft declined.");
            })
          }
        >
          Decline
        </Button>
      )}
    </div>
  );
}
