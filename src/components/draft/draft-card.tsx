"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { formatPesewas } from "@/lib/utils/order";
import { getDraftStatusConfig } from "@/lib/utils/draft";
import type { GqlBlueprintDraft, DraftParty } from "@/types/graphql";

interface DraftCardProps {
  draft: GqlBlueprintDraft;
  viewAs: DraftParty;
}

export function DraftCard({ draft, viewAs }: DraftCardProps) {
  const statusConfig = getDraftStatusConfig(draft.status);
  const other = viewAs === "client" ? draft.designer : draft.client;
  const otherName = other?.fullName ?? "Unknown";
  const garmentType = draft.blueprint?.garment_type ?? "Garment";
  const isYourTurn =
    ["draft", "shared", "revised"].includes(draft.status) &&
    draft.currentTurn === viewAs;

  return (
    <Link
      href={`/drafts/${draft.id}`}
      className="group focus-visible:ring-ring focus-visible:ring-offset-background block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      <GlassCard className="p-5 transition-shadow group-hover:shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <p className="text-muted-foreground text-xs">
              with {otherName}
              {draft.initiatorRole === "designer" ? " (designer pitch)" : ""}
            </p>
            <p className="truncate text-base font-semibold capitalize">
              {garmentType.replace(/_/g, " ")}
            </p>
            {draft.budgetMax != null && (
              <p className="text-muted-foreground text-sm">
                Budget up to {formatPesewas(draft.budgetMax)}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={statusConfig.tone}>{statusConfig.label}</Badge>
            {isYourTurn && (
              <span className="text-primary inline-flex items-center gap-1 text-xs font-medium">
                <Clock className="size-3" /> Your move
                <ArrowRight className="size-3" />
              </span>
            )}
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
