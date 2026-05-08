import { cn } from "@/lib/utils";

/**
 * Branded skeleton loader. A soft copper sweep traverses a muted base —
 * crispier than a flat `animate-pulse`, but subtle enough not to compete
 * with real content as it lands.
 *
 * Honors `prefers-reduced-motion` via the global keyframe override in
 * globals.css.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("skeleton-shimmer rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
