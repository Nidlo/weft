import * as React from "react";

import { cn } from "@/lib/utils";

interface SectionProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Small uppercase tracker shown above the title. */
  eyebrow?: React.ReactNode;
  /** Section title — rendered as h2 in display type. */
  title?: React.ReactNode;
  /** Supporting copy underneath the title. */
  description?: React.ReactNode;
  /** Action element rendered on the trailing side of the header (e.g. a "See all" link). */
  action?: React.ReactNode;
  /** Vertical density. */
  density?: "compact" | "default" | "loose";
  /** Center-align the header copy. */
  centered?: boolean;
}

const DENSITY: Record<NonNullable<SectionProps["density"]>, string> = {
  compact: "py-6",
  default: "py-10",
  loose: "py-16",
};

/**
 * Server-component section wrapper — gives every page a consistent
 * eyebrow/title/description rhythm without each consumer rewriting it.
 *
 * Use the `action` slot for trailing controls ("See all" link, sort
 * select, etc.). The header collapses gracefully when none of the
 * optional props are provided.
 */
export function Section({
  eyebrow,
  title,
  description,
  action,
  density = "default",
  centered = false,
  className,
  children,
  ...rest
}: SectionProps) {
  const hasHeader = eyebrow || title || description || action;

  return (
    <section className={cn(DENSITY[density], className)} {...rest}>
      {hasHeader && (
        <header
          className={cn(
            "mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6",
            centered && "items-center text-center sm:flex-col"
          )}
        >
          <div className={cn("min-w-0 flex-1", centered && "max-w-2xl mx-auto")}>
            {eyebrow && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-display mt-2 text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-2 max-w-xl text-pretty text-sm text-muted-foreground sm:text-base">
                {description}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
