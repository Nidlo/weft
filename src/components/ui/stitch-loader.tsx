"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  /** Pixel size of the loader. Default 24. */
  size?: number;
  /** Optional caption shown below the loader (announced to AT). */
  label?: string;
  /**
   * Visual tone. `default` uses foreground (works in both modes against
   * card surfaces). `copper` uses the brand accent — eye-catching for
   * primary loading moments (Fitscan AI processing, payment polling).
   */
  tone?: "default" | "copper";
}

/**
 * Brand loading indicator — a needle stitching through a row of dashes.
 * Each dash dims and brightens in sequence, mimicking the moment thread
 * pulls through fabric.
 *
 * Honors `prefers-reduced-motion` (drops to a static row of dots).
 */
export function StitchLoader({
  size = 24,
  label,
  tone = "default",
  className,
  ...rest
}: Props) {
  const reduced = useReducedMotion();
  const dots = [0, 1, 2, 3, 4];

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
      <div
        className="relative flex items-center justify-center"
        style={{ height: size, width: size * 2 }}
        aria-hidden
      >
        {dots.map((i) => (
          <motion.span
            key={i}
            className={cn(
              "mx-[2px] inline-block rounded-full",
              tone === "copper" ? "bg-copper" : "bg-foreground"
            )}
            style={{ width: size / 6, height: size / 6 }}
            initial={false}
            animate={
              reduced
                ? { opacity: 0.5 }
                : {
                    opacity: [0.25, 1, 0.25],
                    y: [0, -size / 6, 0],
                  }
            }
            transition={{
              duration: 1.1,
              repeat: reduced ? 0 : Infinity,
              delay: i * 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}
      </div>
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
