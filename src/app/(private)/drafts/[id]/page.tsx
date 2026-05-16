"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import {
  useBlueprintDraft,
  useReviseBlueprintDraft,
} from "@/lib/hooks/use-blueprint-drafts";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RevisionTimeline } from "@/components/draft/revision-timeline";
import { DraftActions } from "@/components/draft/draft-actions";
import { getDraftStatusConfig, partyForViewer } from "@/lib/utils/draft";
import { formatPesewas } from "@/lib/utils/order";

export default function DraftDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, isReady } = useAuthGuard({ requireOnboarded: true });
  const { draft, loading, refetch } = useBlueprintDraft(id);
  const { reviseBlueprintDraft, loading: revising } = useReviseBlueprintDraft();
  const router = useRouter();
  const [reviseOpen, setReviseOpen] = useState(false);
  const [message, setMessage] = useState("");

  if (!isReady || !user || (loading && !draft)) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  if (!draft) {
    return (
      <AppShell>
        <div className="py-16 text-center">
          <p className="text-muted-foreground text-sm">
            This draft does not exist or you do not have access to it.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/drafts")}
          >
            Back to drafts
          </Button>
        </div>
      </AppShell>
    );
  }

  const viewerParty = partyForViewer(draft, user.id);
  const statusConfig = getDraftStatusConfig(draft.status);
  const garment = draft.blueprint?.garment_type ?? "Garment";

  const submitRevision = async () => {
    try {
      await reviseBlueprintDraft({
        draftId: draft.id,
        blueprint: draft.blueprint,
        budgetMin: draft.budgetMin ?? undefined,
        budgetMax: draft.budgetMax ?? undefined,
        proposedDeadline: draft.proposedDeadline ?? undefined,
        message: message.trim() || undefined,
      });
      toast.success("Revision sent.");
      setReviseOpen(false);
      setMessage("");
      await refetch();
    } catch (err) {
      const raw = err instanceof Error ? err.message.toLowerCase() : "";
      toast.error(
        raw.includes("turn")
          ? "It is the other party's turn right now."
          : "We could not send your revision. Please try again."
      );
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <button
              type="button"
              className="text-muted-foreground mb-2 text-xs"
              onClick={() => router.push("/drafts")}
            >
              &larr; Drafts
            </button>
            <h1 className="text-2xl font-semibold capitalize">
              {garment.replace(/_/g, " ")} draft
            </h1>
            {draft.budgetMax != null && (
              <p className="text-muted-foreground mt-1 text-sm">
                Budget up to {formatPesewas(draft.budgetMax)}
              </p>
            )}
          </div>
          <Badge variant={statusConfig.tone}>{statusConfig.label}</Badge>
        </header>

        <GlassCard className="p-5">
          <h2 className="mb-3 text-sm font-semibold">History</h2>
          <RevisionTimeline revisions={draft.revisions ?? []} />
        </GlassCard>

        {reviseOpen ? (
          <GlassCard className="space-y-3 p-5">
            <p className="text-sm font-medium">
              Send a revision back to the other party
            </p>
            <textarea
              className="border-input bg-background min-h-24 w-full rounded-md border p-3 text-sm"
              placeholder="What did you change, and why?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <p className="text-muted-foreground text-xs">
              This sends the current design back with your note. To change the
              design itself, open the blueprint builder (coming in the next
              iteration); for now use the note to describe the change.
            </p>
            <div className="flex gap-3">
              <Button onClick={submitRevision} disabled={revising}>
                Send revision
              </Button>
              <Button
                variant="ghost"
                onClick={() => setReviseOpen(false)}
                disabled={revising}
              >
                Cancel
              </Button>
            </div>
          </GlassCard>
        ) : (
          <DraftActions
            draft={draft}
            viewerParty={viewerParty}
            onReviseClick={() => setReviseOpen(true)}
            onChanged={() => {
              void refetch();
            }}
          />
        )}
      </div>
    </AppShell>
  );
}
