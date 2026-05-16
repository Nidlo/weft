"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useBlueprintDrafts } from "@/lib/hooks/use-blueprint-drafts";
import { useSearchClients } from "@/lib/hooks/use-orders";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DraftCard } from "@/components/draft/draft-card";
import type { DraftParty } from "@/types/graphql";

export default function DraftsPage() {
  const { user, isReady } = useAuthGuard({ requireOnboarded: true });
  const { drafts, loading } = useBlueprintDrafts();
  const router = useRouter();
  const { searchClients, results, loading: searching } = useSearchClients();
  const [pitchOpen, setPitchOpen] = useState(false);
  const [q, setQ] = useState("");

  if (!isReady || !user) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  const viewAs: DraftParty = user.isDesigner ? "designer" : "client";

  return (
    <AppShell>
      <div className="space-y-7">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              Collaborate before you commit
            </p>
            <h1 className="mt-1 text-3xl font-semibold">Blueprint drafts</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Brainstorm a design back and forth. Nothing becomes an order until
              both sides agree and you convert it.
            </p>
          </div>
          {viewAs === "designer" && (
            <Button onClick={() => setPitchOpen((v) => !v)}>
              Pitch a design
            </Button>
          )}
        </header>

        {pitchOpen && viewAs === "designer" && (
          <div className="space-y-3 rounded-2xl border p-4">
            <p className="text-sm font-medium">Pitch a design to a client</p>
            <div className="flex gap-2">
              <Input
                placeholder="Search a client by name or phone"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  searchClients(e.target.value);
                }}
              />
              <Button variant="outline" disabled>
                <Search className="size-4" />
              </Button>
            </div>
            {searching && (
              <p className="text-muted-foreground text-xs">Searching...</p>
            )}
            <ul className="divide-y">
              {results.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className="hover:bg-muted/50 flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm"
                    onClick={() =>
                      router.push(`/blueprint?pitchClient=${c.id}`)
                    }
                  >
                    <span>{c.fullName ?? c.phone ?? "Client"}</span>
                    <span className="text-muted-foreground text-xs">
                      Start a pitch
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {loading && drafts.length === 0 ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : drafts.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center text-sm">
            No drafts yet.{" "}
            {viewAs === "client"
              ? "Start a blueprint and choose Save as draft to brainstorm with a designer."
              : "Pitch a design to a client to get started."}
          </p>
        ) : (
          <div className="space-y-3">
            {drafts.map((d) => (
              <DraftCard key={d.id} draft={d} viewAs={viewAs} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
