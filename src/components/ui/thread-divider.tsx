"use client";

import * as React from "react";
import { motion, useReducedMotion, useInView } from "motion/react";

import { cn } from "@/lib/utils";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  /** Length in pixels — used as the SVG viewBox width. */
  width?: number;
  /** Tone of the stitching */
  tone?: "copper" | "muted" | "ink";
  /** Slot a label in the middle of the stitch — eyebrow style. */
  label?: string;
}

const TONE_STROKE: Record<NonNullable<Props["tone"]>, string> = {
  copper: "var(--copper)",
  muted: "var(--muted-foreground)",
  ink: "currentColor",
};

/**
 * A horizontal divider drawn as a stitched thread. Animates in when it
 * scrolls into view, mirroring the brand's needle-and-thread motif.
 *
 * Use between content sections or beneath an eyebrow heading.
 */
export function ThreadDivider({
  width = 320,
  tone = "copper",
  label,
  className,
  ...rest
}: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const animate = inView && !reduced;

  const half = width / 2;
  const labelGap = label ? 80 : 0;
  const leftEnd = half - labelGap / 2;
  const rightStart = half + labelGap / 2;

  return (
    <div
      ref={ref}
      className={cn("flex w-full items-center justify-center gap-3", className)}
      {...rest}
    >
      <svg
        viewBox={`0 0 ${width} 16`}
        height="16"
        width="100%"
        preserveAspectRatio="none"
        aria-hidden
        className="block max-w-full"
      >
        <motion.line
          x1="0"
          y1="8"
          x2={leftEnd}
          y2="8"
          stroke={TONE_STROKE[tone]}
          strokeWidth="1.4"
          strokeDasharray="4 4"
          strokeLinecap="round"
          initial={animate ? { pathLength: 0 } : false}
          animate={animate ? { pathLength: 1 } : { pathLength: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
        {label && (
          <text
            x={half}
            y="11"
            textAnchor="middle"
            fontFamily="var(--font-geist-sans)"
            fontSize="9"
            fontWeight="600"
            letterSpacing="0.18em"
            fill="var(--muted-foreground)"
            style={{ textTransform: "uppercase" }}
          >
            {label}
          </text>
        )}
        <motion.line
          x1={rightStart}
          y1="8"
          x2={width}
          y2="8"
          stroke={TONE_STROKE[tone]}
          strokeWidth="1.4"
          strokeDasharray="4 4"
          strokeLinecap="round"
          initial={animate ? { pathLength: 0 } : false}
          animate={animate ? { pathLength: 1 } : { pathLength: 1 }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.1,
          }}
        />
      </svg>
    </div>
  );
}
