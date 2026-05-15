/**
 * Recognised tour IDs. Must match the allowlist in
 * backend/app/GraphQL/Mutations/MarkTourCompleted.php — adding a new
 * tour means updating BOTH places (typed end-to-end so a typo on
 * either side surfaces immediately).
 */
export type TourId = "home" | "newOrder" | "orderDetail";

export type TourOutcome = "completed" | "skipped";

/** Per-user state read from `me.tourProgress`. */
export type TourProgress = Partial<Record<TourId, TourOutcome>>;

export interface TourStep {
  /**
   * `data-tour-id` value on the target element. Cleaner than CSS
   * selectors and survives refactors as long as the attribute moves
   * with the element. If the anchor can't be found at render time, the
   * step renders centered instead of anchored — the tour still works.
   */
  anchor: string;
  title: string;
  body: string;
  /**
   * Where to place the popover relative to the anchor (desktop only —
   * mobile always uses the bottom sheet). Defaults to "bottom".
   */
  placement?: "top" | "right" | "bottom" | "left";
  /**
   * If true, scroll the anchor into view before showing the step.
   * Default true — long pages would otherwise miss anchors below the
   * fold.
   */
  scrollIntoView?: boolean;
}

export interface TourDefinition {
  id: TourId;
  /** Plain ASCII title shown above the step counter. */
  label: string;
  steps: TourStep[];
}
