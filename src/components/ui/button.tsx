import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[transform,background-color,box-shadow,border-color,color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[var(--shadow-1)] hover:shadow-[var(--shadow-2)]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent/40 hover:text-accent-foreground hover:border-foreground/30 dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent/40 hover:text-accent-foreground dark:hover:bg-accent/30",
        link: "text-primary underline-offset-4 hover:underline",
        // Brand-grade primary - the "buy"/"start" button. Solid ink with a
        // copper glow that breathes on hover.
        luxe: "bg-foreground text-background shadow-[var(--shadow-2)] hover:shadow-[var(--shadow-glow)] hover:-translate-y-px",
        // Outlined luxe - same gravity, lighter footprint.
        "luxe-outline":
          "border border-foreground/80 bg-transparent text-foreground hover:bg-foreground hover:text-background hover:shadow-[var(--shadow-2)] hover:-translate-y-px",
        // Glassy surface button - sits on top of busy backgrounds.
        glass:
          "surface-glass text-foreground hover:shadow-[var(--shadow-3)] hover:-translate-y-px",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-11 rounded-lg px-6 text-[15px] has-[>svg]:px-4",
        xl: "h-13 rounded-xl px-8 text-base font-semibold has-[>svg]:px-5",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /**
     * When true the button displays a spinner in place of its leading content,
     * is `disabled`, and sets `aria-busy="true"`. Footprint stays identical so
     * neighbouring elements don't shift on every state flip. Pair with
     * `loadingLabel` to swap the visible text while loading; otherwise the
     * children are rendered alongside the spinner.
     */
    loading?: boolean;
    loadingLabel?: React.ReactNode;
  };

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  loadingLabel,
  disabled,
  children,
  ...props
}: ButtonProps) {
  // asChild can't host an arbitrary spinner sibling (Slot expects a single
  // child), so when loading we ignore asChild for the spinner overlay and
  // render a real <button>.
  const Comp = asChild && !loading ? Slot : "button";
  const isDisabled = disabled || loading;

  if (loading) {
    return (
      <button
        data-slot="button"
        data-variant={variant}
        data-size={size}
        data-loading="true"
        className={cn(buttonVariants({ variant, size, className }))}
        disabled
        aria-busy="true"
        {...props}
      >
        <Loader2 className="animate-spin" aria-hidden />
        {loadingLabel ?? children}
      </button>
    );
  }

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isDisabled}
      {...props}
    >
      {children}
    </Comp>
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
