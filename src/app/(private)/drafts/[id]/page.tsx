"use client";

import { use } from "react";
import { useRouter } from "next/navigation";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useBlueprintDraft } from "@/lib/hooks/use-blueprint-drafts";
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
  const router = useRouter();

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

        <DraftActions
          draft={draft}
          viewerParty={viewerParty}
          // Revise reopens the blueprint wizard pre-filled from this
          // draft so the reviser edits the actual spec; the wizard
          // submits the edit back as a new revision.
          onReviseClick={() =>
            router.push(`/blueprint?reviseDraft=${draft.id}`)
          }
          onChanged={() => {
            void refetch();
          }}
        />
      </div>
    </AppShell>
  );
}
