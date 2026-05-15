"use client";

import { useRouter } from "next/navigation";
import { Compass, Check, RotateCcw } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

import { TOURS, ROUTE_FOR } from "./registry";
import type { TourId } from "./types";
import { useTour } from "./use-tour";

// Display order in the replay list - roughly the order a new user meets
// each surface.
const TOUR_ORDER: TourId[] = [
  "home",
  "dashboard",
  "newOrder",
  "orderDetail",
  "measurements",
  "profileEdit",
  "messages",
];

/**
 * Lists every available tour with its current status and a replay
 * button. Used in /settings under "Show me around" and in the header
 * help-icon menu. Replay forces the tour even if the user has already
 * marked it completed or skipped.
 */
export function ReplayMenu({ onReplay }: { onReplay?: () => void }) {
  const tour = useTour();
  const router = useRouter();

  const start = (tourId: TourId) => {
    const route = ROUTE_FOR[tourId];
    if (
      route &&
      typeof window !== "undefined" &&
      window.location.pathname !== route
    ) {
      router.push(route);
    }
    tour.start(tourId, { force: true });
    onReplay?.();
  };

  return (
    <GlassCard variant="solid" className="divide-border/60 divide-y p-2">
      {TOUR_ORDER.map((id) => {
        const def = TOURS[id];
        const status = tour.progress[id];
        return (
          <div key={id} className="flex items-center gap-3 px-3 py-3">
            <span className="bg-secondary text-foreground ring-border flex size-10 shrink-0 items-center justify-center rounded-xl ring-1">
              <Compass className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-display flex items-center gap-2 text-sm font-semibold tracking-tight">
                {def.label}
                {status === "completed" && (
                  <span className="border-status-success-soft bg-status-success-soft/40 text-status-success-fg inline-flex items-center gap-1 rounded-full border px-1.5 py-0 text-[9px] font-semibold tracking-wider uppercase">
                    <Check className="h-3 w-3" aria-hidden />
                    Done
                  </span>
                )}
                {status === "skipped" && (
                  <span className="border-border bg-card/60 text-muted-foreground rounded-full border px-1.5 py-0 text-[9px] font-semibold tracking-wider uppercase">
                    Skipped
                  </span>
                )}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {def.steps.length} steps
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => start(id)}
              className="gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Replay
            </Button>
          </div>
        );
      })}
    </GlassCard>
  );
}
