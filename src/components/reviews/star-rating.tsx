"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const LABELS = ["", "Poor", "Below Average", "Average", "Good", "Excellent"];

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function StarRating({
  value,
  onChange,
  size = "md",
  showLabel = false,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const isInteractive = !!onChange;
  const displayValue = hoverValue || value;

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!isInteractive}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => isInteractive && setHoverValue(star)}
            onMouseLeave={() => isInteractive && setHoverValue(0)}
            className={cn(
              "transition-colors",
              isInteractive && "cursor-pointer hover:scale-110 active:scale-95",
              !isInteractive && "cursor-default",
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                star <= displayValue
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-none text-muted-foreground/30",
              )}
            />
          </button>
        ))}
      </div>
      {showLabel && displayValue > 0 && (
        <span className="ml-1 text-sm font-medium text-muted-foreground">
          {LABELS[displayValue]}
        </span>
      )}
    </div>
  );
}
