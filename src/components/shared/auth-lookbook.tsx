"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Crown,
  Scissors,
  Shirt,
  Sparkles,
  Heart,
  Star,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface Tile {
  caption: string;
  craft: string;
  rating?: string;
  icon: LucideIcon;
  /** Gradient class — applied to the tile background. */
  gradient: string;
  /** Tone of the icon + accents on top of the gradient. */
  accent: "ink" | "bone" | "copper";
}

/**
 * 12 lookbook tiles — Ghana-fashion-flavored captions, rotating gradients
 * across the warm/charcoal/copper palette. Pure CSS + lucide; zero external
 * images. The order is fixed so the duplicated marquee track loops cleanly.
 */
const LOOKBOOK: Tile[] = [
  {
    caption: "Adwoa M.",
    craft: "Kaba & Slit",
    rating: "4.9",
    icon: Sparkles,
    gradient: "from-[oklch(0.18_0.018_50)] to-[oklch(0.32_0.05_60)]",
    accent: "bone",
  },
  {
    caption: "Kojo Atelier",
    craft: "Bespoke Suits",
    rating: "5.0",
    icon: Scissors,
    gradient: "from-[oklch(0.92_0.05_70)] to-[oklch(0.74_0.11_60)]",
    accent: "ink",
  },
  {
    caption: "Esi Studio",
    craft: "Wedding Gown",
    rating: "4.8",
    icon: Crown,
    gradient: "from-[oklch(0.97_0.008_75)] to-[oklch(0.89_0.05_70)]",
    accent: "ink",
  },
  {
    caption: "Yaw Designs",
    craft: "Agbada",
    rating: "4.9",
    icon: Star,
    gradient: "from-[oklch(0.16_0.012_50)] to-[oklch(0.18_0.018_50)]",
    accent: "copper",
  },
  {
    caption: "Ama House",
    craft: "Ankara Couture",
    rating: "4.7",
    icon: Shirt,
    gradient: "from-[oklch(0.74_0.11_60)] to-[oklch(0.55_0.10_45)]",
    accent: "bone",
  },
  {
    caption: "Nana Studio",
    craft: "Children's",
    rating: "5.0",
    icon: Heart,
    gradient: "from-[oklch(0.94_0.012_75)] to-[oklch(0.85_0.06_70)]",
    accent: "ink",
  },
  {
    caption: "Kente & Co.",
    craft: "Traditional",
    rating: "4.9",
    icon: Sparkles,
    gradient: "from-[oklch(0.42_0.08_55)] to-[oklch(0.28_0.04_60)]",
    accent: "copper",
  },
  {
    caption: "Akua Bespoke",
    craft: "Evening Wear",
    rating: "4.8",
    icon: Crown,
    gradient: "from-[oklch(0.18_0.018_50)] to-[oklch(0.45_0.08_60)]",
    accent: "copper",
  },
  {
    caption: "Maame Atelier",
    craft: "Alterations",
    rating: "4.7",
    icon: Scissors,
    gradient: "from-[oklch(0.85_0.04_75)] to-[oklch(0.74_0.11_60)]",
    accent: "ink",
  },
  {
    caption: "Kwame Studio",
    craft: "Streetwear",
    rating: "4.6",
    icon: Star,
    gradient: "from-[oklch(0.22_0.015_50)] to-[oklch(0.16_0.012_50)]",
    accent: "bone",
  },
  {
    caption: "Afi Designs",
    craft: "Contemporary",
    rating: "4.9",
    icon: Shirt,
    gradient: "from-[oklch(0.92_0.05_70)] to-[oklch(0.78_0.08_55)]",
    accent: "ink",
  },
  {
    caption: "Sika Atelier",
    craft: "Couture",
    rating: "5.0",
    icon: Sparkles,
    gradient: "from-[oklch(0.32_0.05_60)] to-[oklch(0.16_0.012_50)]",
    accent: "copper",
  },
];

const ACCENT_COLORS: Record<Tile["accent"], { fg: string; ring: string }> = {
  ink: {
    fg: "text-[oklch(0.16_0.012_50)]",
    ring: "ring-[oklch(0.16_0.012_50)]/15",
  },
  bone: {
    fg: "text-[oklch(0.97_0.008_75)]",
    ring: "ring-[oklch(0.97_0.008_75)]/20",
  },
  copper: {
    fg: "text-[oklch(0.78_0.13_65)]",
    ring: "ring-[oklch(0.78_0.13_65)]/30",
  },
};

interface AuthLookbookProps {
  /**
   * Direction of travel. The two columns scroll in opposite directions for
   * parallax depth.
   */
  direction?: "up" | "down";
  /** Animation cycle length in seconds. */
  duration?: number;
  className?: string;
}

/**
 * Fashion lookbook marquee — a vertical infinite scroll of editorial tiles
 * that flank the auth card on `lg+` viewports. Each tile is a styled
 * gradient with a lucide icon, designer name, craft, and a subtle ankara
 * stitch overlay. Pure CSS + motion; no external images.
 *
 * Stops still under `prefers-reduced-motion`.
 */
export function AuthLookbook({
  direction = "up",
  duration = 60,
  className,
}: AuthLookbookProps) {
  const reduced = useReducedMotion();

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden",
        // Top + bottom fades so the marquee doesn't read as a hard cut
        "mask-[linear-gradient(to_bottom,transparent_0%,black_8%,black_92%,transparent_100%)]",
        className
      )}
      aria-hidden
    >
      <motion.div
        className="flex flex-col gap-4"
        animate={
          reduced
            ? undefined
            : { y: direction === "up" ? ["0%", "-50%"] : ["-50%", "0%"] }
        }
        transition={{
          duration: reduced ? 0 : duration,
          repeat: reduced ? 0 : Infinity,
          ease: "linear",
        }}
      >
        {/* Render twice so the loop reads seamlessly */}
        {[...LOOKBOOK, ...LOOKBOOK].map((tile, idx) => (
          <LookbookTile key={`${tile.caption}-${idx}`} tile={tile} />
        ))}
      </motion.div>
    </div>
  );
}

function LookbookTile({ tile }: { tile: Tile }) {
  const Icon = tile.icon;
  const accent = ACCENT_COLORS[tile.accent];

  return (
    <article
      className={cn(
        "relative aspect-4/5 w-full shrink-0 overflow-hidden rounded-2xl",
        "bg-linear-to-br shadow-(--shadow-2) ring-1",
        tile.gradient,
        accent.ring
      )}
    >
      {/* Ankara-inspired stitch overlay — subtle pattern adds texture */}
      <StitchPattern accent={tile.accent} />

      {/* Embossed icon — sits in the upper-right, bigger than the caption */}
      <Icon
        className={cn("absolute top-3 right-3 h-7 w-7 opacity-50", accent.fg)}
        aria-hidden
      />

      {/* Editorial caption — bottom-aligned */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 p-4 backdrop-blur-[2px]",
          accent.fg
        )}
      >
        <p
          className={cn(
            "text-[10px] font-semibold tracking-[0.16em] uppercase opacity-75"
          )}
        >
          {tile.craft}
        </p>
        <p className="text-display mt-0.5 text-base font-semibold tracking-tight">
          {tile.caption}
        </p>
        {tile.rating && (
          <p className="mt-1 flex items-center gap-1 text-[11px] font-medium opacity-80">
            <Star className="h-3 w-3 fill-current" aria-hidden />
            <span className="tabular-nums">{tile.rating}</span>
          </p>
        )}
      </div>
    </article>
  );
}

/**
 * SVG diagonal stitch pattern overlay — gives every tile a subtle, on-brand
 * texture that hints at fabric weave without competing with the caption.
 */
function StitchPattern({ accent }: { accent: Tile["accent"] }) {
  const stroke = {
    ink: "oklch(0.16 0.012 50 / 0.18)",
    bone: "oklch(0.97 0.008 75 / 0.22)",
    copper: "oklch(0.78 0.13 65 / 0.25)",
  }[accent];

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <pattern
          id={`stitch-${accent}`}
          width="14"
          height="14"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(35)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="14"
            stroke={stroke}
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#stitch-${accent})`} />
    </svg>
  );
}

interface AuthTagMarqueeProps {
  className?: string;
  duration?: number;
}

const TAGS = [
  "Bespoke",
  "Kaba & Slit",
  "Wedding Gown",
  "Agbada",
  "Ankara Couture",
  "Tailored Suit",
  "Streetwear",
  "Children's",
  "Kente & Co.",
  "Evening Wear",
  "Alterations",
  "Couture",
];

/**
 * Horizontal companion marquee — scrolls a row of editorial craft tags.
 * Used at the bottom of the auth screen on smaller viewports where the
 * vertical lookbook columns wouldn't fit.
 */
export function AuthTagMarquee({
  className,
  duration = 40,
}: AuthTagMarqueeProps) {
  const reduced = useReducedMotion();

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        "mask-[linear-gradient(to_right,transparent_0%,black_5%,black_95%,transparent_100%)]",
        className
      )}
      aria-hidden
    >
      <motion.div
        className="flex w-max gap-2 py-2"
        animate={reduced ? undefined : { x: ["0%", "-50%"] }}
        transition={{
          duration: reduced ? 0 : duration,
          repeat: reduced ? 0 : Infinity,
          ease: "linear",
        }}
      >
        {[...TAGS, ...TAGS].map((tag, idx) => (
          <span
            key={`${tag}-${idx}`}
            className={cn(
              "border-border bg-background/60 inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5",
              "text-foreground/80 text-xs font-medium backdrop-blur"
            )}
          >
            <span className="bg-copper size-1 rounded-full" aria-hidden />
            {tag}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
