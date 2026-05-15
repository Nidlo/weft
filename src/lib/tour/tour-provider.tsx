"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation } from "@apollo/client/react";

import { MARK_TOUR_COMPLETED } from "@/lib/graphql/mutations/tour";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { TOURS } from "./registry";
import type { TourOutcome } from "./types";
import { useTourStore } from "./use-tour";

interface AnchorRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const MOBILE_BREAKPOINT_PX = 640;

/**
 * Renders the active tour step. Anchors the popover to the element with
 * `data-tour-id="<anchor>"`; on mobile (< 640px) renders as a bottom
 * sheet instead so the user always sees the copy regardless of where
 * the anchor sits on a small screen.
 *
 * Mounts once in providers.tsx — components anywhere in the tree call
 * `useTour().start("home")` to fire a tour.
 */
export function TourProvider() {
  const activeTour = useTourStore((s) => s.activeTour);
  const step = useTourStore((s) => s.step);
  const next = useTourStore((s) => s.next);
  const back = useTourStore((s) => s.back);
  const finish = useTourStore((s) => s.finish);
  const markPersisted = useTourStore((s) => s.markPersisted);

  const [markTour] = useMutation(MARK_TOUR_COMPLETED);
  const [isMobile, setIsMobile] = useState(false);
  const [anchorRect, setAnchorRect] = useState<AnchorRect | null>(null);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`);
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const tour = activeTour ? TOURS[activeTour] : null;
  const current = tour ? tour.steps[step] : null;

  // Resolve the anchor's bounding rect each time the step changes, plus
  // on scroll/resize so the ghost-anchor tracks the target. If the
  // element isn't in the DOM yet, render the popover centered (Radix
  // falls back to viewport center when there's no anchor).
  //
  // The setAnchorRect(null) calls inside this effect *are* the React
  // 19 anti-pattern shape (sync setState in an effect body), but the
  // alternative — deriving the rect via render — can't work: we're
  // measuring a foreign DOM element on scroll/resize, which is exactly
  // the "subscribe to external state" escape hatch React docs allow.
  // Stale rect would otherwise stick after a step transitions to an
  // anchor that doesn't exist yet, putting the ghost at the previous
  // step's position.
  useEffect(() => {
    if (!current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnchorRect(null);
      return;
    }
    const el = document.querySelector<HTMLElement>(
      `[data-tour-id="${current.anchor}"]`
    );
    if (!el) {
      setAnchorRect(null);
      return;
    }
    if (current.scrollIntoView !== false) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    const update = () => {
      const r = el.getBoundingClientRect();
      setAnchorRect({
        top: r.top + window.scrollY,
        left: r.left + window.scrollX,
        width: r.width,
        height: r.height,
      });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [current]);

  const finishWith = useMemo(
    () => async (outcome: TourOutcome) => {
      if (!activeTour) return;
      const tourId = activeTour;
      finish(outcome);
      try {
        await markTour({ variables: { tour: tourId, outcome } });
        markPersisted(tourId, outcome);
      } catch {
        // Low-criticality. A failed mark just means the tour might
        // replay next session — annoying but not breaking. Silent.
      }
    },
    [activeTour, finish, markTour, markPersisted]
  );

  if (!tour || !current) return null;

  const isLast = step === tour.steps.length - 1;
  const totalSteps = tour.steps.length;

  const body = (
    <div className="space-y-3">
      <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
        {tour.label} {step + 1} / {totalSteps}
      </p>
      <p className="text-sm leading-relaxed">{current.body}</p>
      <div className="flex items-center justify-between gap-2 pt-1">
        <Button variant="ghost" size="sm" onClick={() => finishWith("skipped")}>
          Skip tour
        </Button>
        <div className="flex items-center gap-2">
          {step > 0 && (
            <Button variant="ghost" size="sm" onClick={back}>
              Back
            </Button>
          )}
          <Button
            variant="luxe"
            size="sm"
            onClick={() => {
              if (isLast) {
                finishWith("completed");
              } else {
                next(totalSteps);
              }
            }}
          >
            {isLast ? "Done" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet
        open
        onOpenChange={(open) => {
          if (!open) finishWith("skipped");
        }}
      >
        <SheetContent side="bottom" className="rounded-t-2xl pb-8">
          <SheetHeader className="space-y-1 text-left">
            <SheetTitle>{current.title}</SheetTitle>
            <SheetDescription className="sr-only">
              Step {step + 1} of {totalSteps} in the {tour.label} tour
            </SheetDescription>
          </SheetHeader>
          {body}
        </SheetContent>
      </Sheet>
    );
  }

  // Ghost anchor: an absolutely-positioned, invisible div mirroring the
  // target element's rect. Radix anchors the popover off this ghost so
  // we don't need virtualRef (which the Anchor primitive doesn't
  // expose). The ring around the ghost gives a subtle visual cue.
  const ghost = anchorRect
    ? createPortal(
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            top: anchorRect.top,
            left: anchorRect.left,
            width: anchorRect.width,
            height: anchorRect.height,
          }}
        >
          <PopoverAnchor className="block h-full w-full" />
          <span className="ring-copper/70 absolute inset-0 rounded-md ring-2 ring-offset-2" />
        </div>,
        document.body
      )
    : null;

  return (
    <Popover
      open
      onOpenChange={(open) => {
        if (!open) finishWith("skipped");
      }}
    >
      {ghost}
      <PopoverContent
        side={current.placement ?? "bottom"}
        className="w-88 max-w-[calc(100vw-2rem)] space-y-1 p-5"
      >
        <h3 className="text-display text-base font-semibold tracking-tight">
          {current.title}
        </h3>
        {body}
      </PopoverContent>
    </Popover>
  );
}
