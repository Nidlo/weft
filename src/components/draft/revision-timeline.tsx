"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { formatPesewas } from "@/lib/utils/order";
import type { GqlBlueprintDraftRevision } from "@/types/graphql";

interface RevisionTimelineProps {
  revisions: GqlBlueprintDraftRevision[];
}

/**
 * The back-and-forth history, oldest first (the API already orders by
 * created_at). Each entry shows who authored it, their side, the message,
 * and the budget snapshot at that point so both parties can see how the
 * proposal moved.
 */
export function RevisionTimeline({ revisions }: RevisionTimelineProps) {
  if (revisions.length === 0) {
    return <p className="text-muted-foreground text-sm">No revisions yet.</p>;
  }

  return (
    <ol className="space-y-3">
      {revisions.map((rev, i) => (
        <li key={rev.id}>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">
                {rev.author?.fullName ?? "Unknown"}
              </p>
              <Badge variant="secondary" className="capitalize">
                {rev.authorRole}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Revision {i + 1}
              {rev.budgetMax != null && (
                <> · budget up to {formatPesewas(rev.budgetMax)}</>
              )}
            </p>
            {rev.message && (
              <p className="mt-2 text-sm whitespace-pre-line">{rev.message}</p>
            )}
          </GlassCard>
        </li>
      ))}
    </ol>
  );
}
