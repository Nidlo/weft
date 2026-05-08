"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

import { cn } from "@/lib/utils";

interface MotionContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Stagger delay between children, in seconds. */
  stagger?: number;
  /** Initial delay before the first child animates. */
  delay?: number;
  /** Trigger animation only when scrolled into view. */
  whenInView?: boolean;
}

interface MotionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Direction the item enters from */
  from?: "up" | "down" | "left" | "right" | "fade";
  /** Distance in pixels for directional entrances. */
  distance?: number;
  /** Override the default duration. */
  duration?: number;
}

const buildItemVariants = (
  from: NonNullable<MotionItemProps["from"]>,
  distance: number
): Variants => {
  const offset: Record<string, { x?: number; y?: number }> = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    fade: {},
  };
  return {
    hidden: { opacity: 0, ...offset[from] },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
    },
  };
};

/**
 * Choreographs a stagger entrance for its `MotionItem` children. Use to
 * compose page-load reveals that feel intentional, not random.
 *
 *     <MotionContainer stagger={0.08}>
 *       <MotionItem from="up">...</MotionItem>
 *       <MotionItem from="up">...</MotionItem>
 *     </MotionContainer>
 */
export function MotionContainer({
  stagger = 0.06,
  delay = 0,
  whenInView = false,
  className,
  children,
  ...rest
}: MotionContainerProps) {
  const reduced = useReducedMotion();

  const variants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduced ? 0 : stagger,
        delayChildren: reduced ? 0 : delay,
      },
    },
  };

  const animateProps = whenInView
    ? { whileInView: "show", viewport: { once: true, amount: 0.2 } }
    : { animate: "show" };

  return (
    <motion.div
      initial="hidden"
      {...animateProps}
      variants={variants}
      className={cn(className)}
      {...(rest as Record<string, unknown>)}
    >
      {children}
    </motion.div>
  );
}

/**
 * Single staggered item. Must be a descendant of `MotionContainer`. The
 * container's variant ("hidden" / "show") propagates automatically.
 */
export function MotionItem({
  from = "up",
  distance = 12,
  duration = 0.5,
  className,
  children,
  ...rest
}: MotionItemProps) {
  const reduced = useReducedMotion();
  const variants = buildItemVariants(from, reduced ? 0 : distance);

  return (
    <motion.div
      variants={variants}
      transition={{
        duration: reduced ? 0 : duration,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(className)}
      {...(rest as Record<string, unknown>)}
    >
      {children}
    </motion.div>
  );
}
