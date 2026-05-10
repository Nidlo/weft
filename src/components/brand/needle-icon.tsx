import * as React from "react";

import { cn } from "@/lib/utils";

interface Props extends React.SVGAttributes<SVGSVGElement> {
  /** Render the trailing thread arc (decorative) */
  withThread?: boolean;
}

/**
 * Brand mark — the needle. Used as a logomark, loading-spinner core, and
 * inline accent. Drawn at 24×24 with `currentColor` for the body and
 * `var(--copper)` for the eye highlight, so it tints with the surrounding
 * type.
 */
export function NeedleIcon({ className, withThread = false, ...props }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("size-5", className)}
      {...props}
    >
      {/* Needle body — slim, slightly tapered */}
      <path d="M5 19 L18.2 5.8" stroke="currentColor" strokeWidth="1.6" />
      {/* Pointed tip */}
      <path
        d="M18.2 5.8 L20 4 L19.2 6.6 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="currentColor"
      />
      {/* Eye of the needle */}
      <ellipse
        cx="6.4"
        cy="17.6"
        rx="1.6"
        ry="0.9"
        transform="rotate(-45 6.4 17.6)"
        stroke="var(--copper)"
        strokeWidth="1.4"
      />
      {/* Optional trailing thread arc */}
      {withThread && (
        <path
          d="M5 19 C 3 17, 2 14, 3.5 12"
          stroke="var(--copper)"
          strokeWidth="1.2"
          strokeDasharray="2 2"
        />
      )}
    </svg>
  );
}
