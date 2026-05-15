"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

type Variant = "logo" | "wordmark" | "wordmark-tagline";

interface Props {
  variant?: Variant;
  /** Pixel height of the mark; width auto-scales. */
  size?: number;
  /** Pause the looping idle animation (e.g. inside dense lists). */
  static?: boolean;
  className?: string;
}

const TAGLINE = "Where every stitch begins.";
const TAGLINE_DISPLAY = "WHERE EVERY STITCH BEGINS.";

/**
 * Nidlo brand wordmark — needle + thread + type.
 *
 * The needle stitches across the wordmark on mount: thread enters from the
 * left, pulls taut, and the type fades in beneath it. Idle, the needle
 * floats and the eye of the needle catches a soft copper shimmer.
 *
 * Respects `prefers-reduced-motion`: drops to a static composition with
 * type fading in, no looping motion.
 */
export function NidloMark({
  variant = "wordmark",
  size = 32,
  static: isStatic = false,
  className,
}: Props) {
  const reduced = useReducedMotion();
  const animate = !reduced && !isStatic;

  if (variant === "logo") {
    return (
      <svg
        height={size}
        width={size}
        viewBox="0 0 48 48"
        aria-label="Nidlo"
        className={cn("text-foreground", className)}
        fill="none"
      >
        <NeedleAndThread animate={animate} />
      </svg>
    );
  }

  // Wordmark: needle on the left, "Nidlo" wordtype to its right.
  // SVG width is generous so the entrance thread has room.
  const wordWidth = variant === "wordmark-tagline" ? 220 : 180;
  return (
    <svg
      height={size}
      viewBox={`0 0 ${wordWidth} 48`}
      aria-label={
        variant === "wordmark-tagline" ? `Nidlo — ${TAGLINE}` : "Nidlo"
      }
      className={cn("text-foreground", className)}
      fill="none"
    >
      <NeedleAndThread animate={animate} />
      <motion.g
        initial={animate ? { opacity: 0, x: -4 } : false}
        animate={animate ? { opacity: 1, x: 0 } : { opacity: 1 }}
        transition={{
          duration: 0.6,
          delay: animate ? 0.55 : 0,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <text
          x="56"
          y="32"
          fontFamily="var(--font-fraunces, var(--font-geist-sans))"
          fontWeight="600"
          fontSize="26"
          fill="currentColor"
          letterSpacing="-0.01em"
        >
          Nidlo
        </text>
        {variant === "wordmark-tagline" && (
          <text
            x="56"
            y="44"
            fontFamily="var(--font-geist-sans)"
            fontWeight="500"
            fontSize="8"
            fill="var(--muted-foreground)"
            letterSpacing="0.08em"
          >
            {TAGLINE_DISPLAY}
          </text>
        )}
      </motion.g>
    </svg>
  );
}

/**
 * The shared logomark glyph used by both `logo` and `wordmark` variants.
 * On mount, the thread draws in (dashoffset → 0), then the needle slides
 * along its path. Idle, the eye of the needle catches a soft shimmer.
 */
function NeedleAndThread({ animate }: { animate: boolean }) {
  return (
    <g>
      {/* Thread loop — draws in on mount, then idle floats */}
      <motion.path
        d="M 4 30 C 8 18, 18 14, 28 22 C 34 27, 38 30, 42 30"
        stroke="var(--copper)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="3 3"
        fill="none"
        initial={animate ? { pathLength: 0, opacity: 0 } : false}
        animate={animate ? { pathLength: 1, opacity: 1 } : { opacity: 1 }}
        transition={{
          pathLength: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.2 },
        }}
      />
      {/* Needle body — slides into place tracing the thread end */}
      <motion.g
        initial={animate ? { x: -8, opacity: 0 } : false}
        animate={animate ? { x: 0, opacity: 1 } : { opacity: 1 }}
        transition={{
          duration: 0.5,
          delay: animate ? 0.4 : 0,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {/* Needle shaft */}
        <line
          x1="14"
          y1="38"
          x2="40"
          y2="14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Needle tip */}
        <path d="M 40 14 L 44 10 L 42 16 Z" fill="currentColor" />
        {/* Eye of the needle — copper, catches the shimmer */}
        <motion.ellipse
          cx="15.5"
          cy="36.5"
          rx="2.4"
          ry="1.2"
          transform="rotate(-45 15.5 36.5)"
          stroke="var(--copper)"
          strokeWidth="1.8"
          fill="none"
          animate={
            animate
              ? {
                  opacity: [1, 0.55, 1],
                }
              : { opacity: 1 }
          }
          transition={
            animate
              ? {
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.1,
                }
              : undefined
          }
        />
      </motion.g>
    </g>
  );
}
