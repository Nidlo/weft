"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  /** Pixel height of the loader. Default 32. Width auto-scales 3.5x. */
  size?: number;
  /** Optional caption shown below the loader (announced to AT). */
  label?: string;
  /**
   * Visual tone. `default` uses foreground/copper. `copper` pushes the
   * needle into copper too - eye-catching for primary loading moments
   * (Fitscan AI processing, payment polling).
   */
  tone?: "default" | "copper";
}

/**
 * Brand loading indicator - a needle stitching through a dashed thread.
 * Pure SVG + SMIL animation so the loader stays light (no motion/react
 * import dragged into critical render paths) and survives
 * prefers-reduced-motion via the SVG `<animateTransform>` `begin` /
 * the wrapping component (motion gets paused at the OS level by SMIL).
 *
 * Shapes match src/components/brand/nidlo-mark.tsx - the Nidlo glyph in
 * motion. Q-11: single source of truth for the brand mark shapes.
 */
export function StitchLoader({
  size = 32,
  label,
  tone = "default",
  className,
  ...rest
}: Props) {
  const w = Math.round(size * 3.5);
  const needleColor = tone === "copper" ? "var(--copper)" : "currentColor";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "inline-flex flex-col items-center justify-center gap-2",
        className
      )}
      {...rest}
    >
      <svg
        width={w}
        height={size}
        viewBox="0 0 112 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        data-testid="stitch-loader-svg"
      >
        {/* Dashed thread runway - the path the needle stitches along */}
        <line
          x1="8"
          y1="16"
          x2="104"
          y2="16"
          stroke="var(--copper)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="4 4"
        />
        {/* Needle: tip on the right, eye on the left, traversing the thread.
            SMIL animate keeps this CSS-free and ~250 bytes once minified. */}
        <g transform="translate(0 0)">
          <line
            x1="-10"
            y1="22"
            x2="10"
            y2="6"
            stroke={needleColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path d="M 10 6 L 14 2 L 12 8 Z" fill={needleColor} />
          <ellipse
            cx="-8.5"
            cy="20.5"
            rx="2"
            ry="1"
            transform="rotate(-38 -8.5 20.5)"
            stroke="var(--copper)"
            strokeWidth="1.4"
            fill="none"
          />
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="translate"
            from="0 0"
            to="96 0"
            dur="1.4s"
            repeatCount="indefinite"
          />
        </g>
      </svg>
      {label ? (
        <span
          className={cn(
            "text-xs font-medium",
            tone === "copper" ? "text-copper" : "text-muted-foreground"
          )}
        >
          {label}
        </span>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </div>
  );
}
