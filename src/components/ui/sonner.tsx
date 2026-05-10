"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

import { StitchLoader } from "./stitch-loader";

/**
 * Brand-styled Sonner toaster.
 *
 * - On mobile we anchor toasts to the top-center so they don't fight the
 *   fixed bottom-nav (`pb-[safe-area-inset-bottom]` would still cover the
 *   tab row on iPhone home-indicator devices).
 * - On md+ we keep them bottom-right, the desktop default.
 * - Icons use lucide for clarity; the loading state swaps to the brand
 *   StitchLoader so spinners match the rest of the app.
 * - Copper-soft borders + a thicker rounded radius keep them on-brand.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      mobileOffset={{ top: "1rem" }}
      offset={{ bottom: "1rem", right: "1rem" }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:gap-3 group-[.toaster]:rounded-2xl group-[.toaster]:border-border/60 group-[.toaster]:shadow-(--shadow-2)",
          title: "text-display tracking-tight",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-foreground group-[.toast]:text-background group-[.toast]:rounded-xl group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:bg-secondary group-[.toast]:text-foreground group-[.toast]:rounded-xl",
          success: "group-[.toaster]:border-status-success/40",
          error: "group-[.toaster]:border-status-error/40",
          warning: "group-[.toaster]:border-status-warning/40",
          info: "group-[.toaster]:border-copper/40",
        },
      }}
      icons={{
        success: (
          <CircleCheckIcon className="text-status-success size-4" aria-hidden />
        ),
        info: <InfoIcon className="text-copper size-4" aria-hidden />,
        warning: (
          <TriangleAlertIcon
            className="text-status-warning size-4"
            aria-hidden
          />
        ),
        error: (
          <OctagonXIcon className="text-status-error size-4" aria-hidden />
        ),
        loading: <StitchLoader size={16} tone="copper" aria-hidden />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "1rem",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
