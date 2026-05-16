import * as React from "react";

import { cn } from "@/lib/utils";

interface Props extends Omit<React.HTMLAttributes<HTMLDivElement>, "role"> {
  /** Which canonical Fitscan pose to draw. */
  variant: "front" | "side";
  /**
   * Layout density.
   * - `hero` (default): used in the instructions step. Tall figure with
   *   full caption underneath.
   * - `thumb`: used inline next to each photo upload. Compact horizontal
   *   layout - small figure with caption beside it.
   */
  size?: "hero" | "thumb";
  /**
   * Override the auto-generated accessible label. Default labels describe
   * the pose precisely so screen-reader users still get the instruction.
   */
  ariaLabel?: string;
}

const POSE_LABELS = {
  front:
    "Front pose: face the camera, arms angled down and away from your sides at roughly 45 degrees, palms facing down.",
  side: "Side pose: turn 90 degrees so the camera sees your profile, arms extended forward at shoulder height, palms facing each other.",
} as const;

const POSE_TITLES = {
  front: "Front pose",
  side: "Side pose",
} as const;

const POSE_HINTS = {
  front: "Arms angled away from sides · palms down",
  side: "Profile turn · arms forward · palms in",
} as const;

/**
 * Stylised SMPL-X intake pose illustration. We deliberately use a clean
 * geometric figure (head, torso, limbs) rather than a photographic
 * silhouette: it stays gender-neutral, scales without aliasing, is ~1KB
 * inline, and matches the editorial brand. Copper accents the arms - the
 * meaningful pose element - so users' eyes land on the part that's most
 * commonly wrong.
 */
export function PoseIllustration({
  variant,
  size = "hero",
  ariaLabel,
  className,
  ...rest
}: Props) {
  const label = ariaLabel ?? POSE_LABELS[variant];

  if (size === "thumb") {
    return (
      <div
        role="img"
        aria-label={label}
        className={cn(
          "border-border bg-card/40 flex items-center gap-3 rounded-xl border p-3",
          className
        )}
        {...rest}
      >
        <PoseFigure
          variant={variant}
          className="text-foreground/80 h-16 w-12 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-display text-sm font-semibold tracking-tight">
            {POSE_TITLES[variant]}
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs leading-snug">
            {POSE_HINTS[variant]}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "border-border bg-card/40 flex flex-col items-center gap-3 rounded-2xl border p-4 sm:p-5",
        className
      )}
      {...rest}
    >
      <PoseFigure
        variant={variant}
        className="text-foreground/80 h-36 w-24 sm:h-44 sm:w-28"
      />
      <div className="space-y-1 text-center">
        <p className="text-display text-sm font-semibold tracking-tight">
          {POSE_TITLES[variant]}
        </p>
        <p className="text-muted-foreground text-xs leading-snug">
          {POSE_HINTS[variant]}
        </p>
      </div>
    </div>
  );
}

interface FigureProps extends React.SVGAttributes<SVGSVGElement> {
  variant: "front" | "side";
}

/**
 * Raw SVG body figure. Coordinates are tuned to the 100×140 viewBox so
 * the head, torso, limbs read clearly at thumbnail size (~48px wide) up
 * through hero size (~112px wide).
 *
 * Why the arms are stroked in copper while the rest of the body is the
 * default text colour: the arm position is the part users most often get
 * wrong on their first scan (T-pose, arms-at-sides, hands-in-pockets).
 * Highlighting just that segment focuses attention on the pose-critical
 * element.
 */
function PoseFigure({ variant, className, ...props }: FigureProps) {
  return (
    <svg
      viewBox="0 0 100 140"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      {...props}
    >
      {variant === "front" ? <FrontPose /> : <SidePose />}
    </svg>
  );
}

function FrontPose() {
  return (
    <>
      {/* Head */}
      <circle cx="50" cy="20" r="9" stroke="currentColor" strokeWidth="1.8" />
      {/* Neck */}
      <line
        x1="50"
        y1="29"
        x2="50"
        y2="34"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {/* Shoulders + torso outline (rounded trapezoid that narrows slightly to hips) */}
      <path
        d="M36 38 Q34 38 34 40 L36 78 Q36 80 38 80 L62 80 Q64 80 64 78 L66 40 Q66 38 64 38 Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {/* Arms - A-pose, angled down and out, palms down (small horizontal cap at the wrist).
          Stroked in copper because arm angle is the critical pose element. */}
      <line
        x1="36"
        y1="40"
        x2="18"
        y2="70"
        stroke="var(--copper)"
        strokeWidth="2.2"
      />
      <line
        x1="64"
        y1="40"
        x2="82"
        y2="70"
        stroke="var(--copper)"
        strokeWidth="2.2"
      />
      {/* Hand caps - short horizontal lines indicate "palms down" */}
      <line
        x1="14"
        y1="71"
        x2="22"
        y2="71"
        stroke="var(--copper)"
        strokeWidth="2.2"
      />
      <line
        x1="78"
        y1="71"
        x2="86"
        y2="71"
        stroke="var(--copper)"
        strokeWidth="2.2"
      />
      {/* Legs - slight stance, slightly apart */}
      <line
        x1="42"
        y1="80"
        x2="40"
        y2="124"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <line
        x1="58"
        y1="80"
        x2="60"
        y2="124"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      {/* Feet - short horizontal segments */}
      <line
        x1="34"
        y1="126"
        x2="46"
        y2="126"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <line
        x1="54"
        y1="126"
        x2="66"
        y2="126"
        stroke="currentColor"
        strokeWidth="2.2"
      />
    </>
  );
}

function SidePose() {
  return (
    <>
      {/* Head in profile - circle with a small nose bump pointing right */}
      <circle cx="46" cy="20" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M55 19 L58 20 L55 22" stroke="currentColor" strokeWidth="1.4" />
      {/* Neck */}
      <line
        x1="46"
        y1="29"
        x2="46"
        y2="34"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {/* Torso - narrow vertical because in profile the body reads thin */}
      <path
        d="M40 38 Q38 38 38 40 L40 80 Q40 82 42 82 L52 82 Q54 82 54 80 L52 40 Q52 38 50 38 Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {/* Arms extended forward (both arms read as a single forward line in profile),
          ends with a small vertical hand cap → "palms facing each other" */}
      <line
        x1="48"
        y1="42"
        x2="86"
        y2="40"
        stroke="var(--copper)"
        strokeWidth="2.2"
      />
      <line
        x1="86"
        y1="36"
        x2="86"
        y2="44"
        stroke="var(--copper)"
        strokeWidth="2.2"
      />
      {/* Legs in profile - front leg slightly forward, back leg behind */}
      <line
        x1="48"
        y1="82"
        x2="50"
        y2="124"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <line
        x1="44"
        y1="82"
        x2="42"
        y2="124"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      {/* Feet - profile view, two stacked toe segments */}
      <line
        x1="44"
        y1="126"
        x2="58"
        y2="126"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <line
        x1="36"
        y1="128"
        x2="48"
        y2="128"
        stroke="currentColor"
        strokeWidth="2.2"
      />
    </>
  );
}
