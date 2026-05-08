import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const glassCardVariants = cva(
  "relative rounded-2xl backdrop-blur-xl backdrop-saturate-150 transition-[transform,box-shadow,border-color] duration-300",
  {
    variants: {
      variant: {
        // The default frosted glass surface — bone in light, deep in dark.
        default:
          "surface-glass text-card-foreground",
        // Solid white-ish lift used for primary content cards.
        solid:
          "bg-card text-card-foreground border border-border shadow-[var(--shadow-2)]",
        // Heavier glass — for elevated dialogs / sticky panels.
        strong:
          "surface-glass-strong text-card-foreground",
        // Outlined ghost surface — used inside other glass containers.
        ghost:
          "border border-border/60 text-card-foreground",
      },
      interactive: {
        true: "cursor-pointer hover:-translate-y-0.5 hover:shadow-[var(--shadow-3)] hover:border-foreground/15",
        false: "",
      },
      glow: {
        copper: "hover:shadow-[var(--shadow-glow)]",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      interactive: false,
      glow: "none",
    },
  }
);

export interface GlassCardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof glassCardVariants> {
  asChild?: boolean;
}

/**
 * Frosted-glass surface with the iOS-26 vibe — translucent fill, hairline
 * border, soft elevation. Use for hero compositions, floating panels, and
 * decorative content cards.
 *
 * Pair with a busy/colored backdrop (gradient, image, mesh) so the blur
 * has something to refract.
 */
export function GlassCard({
  className,
  variant,
  interactive,
  glow,
  ...props
}: GlassCardProps) {
  return (
    <div
      data-slot="glass-card"
      data-variant={variant ?? "default"}
      className={cn(glassCardVariants({ variant, interactive, glow }), className)}
      {...props}
    />
  );
}
