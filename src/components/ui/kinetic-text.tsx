"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

interface Props extends React.HTMLAttributes<HTMLSpanElement> {
  /** The phrase to animate. Plain text only. */
  children: string;
  /** Stagger delay between words (seconds). */
  stagger?: number;
  /** Delay before the first word reveals (seconds). */
  delay?: number;
}

/**
 * Word-by-word kinetic reveal — used for editorial display headlines.
 * Each word fades + slides up on mount, with a brand-curve ease.
 *
 * Use sparingly (one per page max). Pair with `text-display` for the
 * full editorial treatment.
 */
export function KineticText({
  children,
  stagger = 0.07,
  delay = 0.05,
  className,
  ...rest
}: Props) {
  const reduced = useReducedMotion();
  const words = React.useMemo(() => children.split(" "), [children]);

  return (
    <span
      className={cn("inline-block", className)}
      aria-label={children}
      {...rest}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          aria-hidden
          initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: "0.6em" }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduced ? 0 : 0.65,
            delay: reduced ? 0 : delay + i * stagger,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="inline-block whitespace-pre"
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  );
}
