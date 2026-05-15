"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  size?: "icon-sm" | "icon" | "icon-lg";
}

/**
 * Icon-only theme toggle. Cross-fades sun/moon with a soft rotation -
 * subtle enough to not distract from form interactions but distinctive
 * enough to feel intentional.
 */
export function ThemeToggle({ className, size = "icon" }: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const reduced = useReducedMotion();

  React.useEffect(() => setMounted(true), []);

  // Pre-hydration placeholder keeps layout stable + avoids the
  // sun-vs-moon flash on cold load.
  // `min-h-11 min-w-11` enforces the 44px tap-target minimum without
  // growing the visual button size - Tailwind hit-area pattern.
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size={size}
        className={cn("min-h-11 min-w-11", className)}
        aria-hidden
        tabIndex={-1}
      >
        <Sun className="h-4 w-4 opacity-0" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";
  const next = isDark ? "light" : "dark";

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={() => setTheme(next)}
      className={cn("relative min-h-11 min-w-11", className)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={
            reduced ? { opacity: 0 } : { opacity: 0, rotate: -45, scale: 0.6 }
          }
          animate={
            reduced ? { opacity: 1 } : { opacity: 1, rotate: 0, scale: 1 }
          }
          exit={
            reduced ? { opacity: 0 } : { opacity: 0, rotate: 45, scale: 0.6 }
          }
          transition={{
            duration: reduced ? 0.1 : 0.32,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="flex"
        >
          {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
