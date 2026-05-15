"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRODUCTION_STAGES, getStatusConfig } from "@/lib/utils/order";

interface OrderProgressBarProps {
  currentStatus: string;
}

export function OrderProgressBar({ currentStatus }: OrderProgressBarProps) {
  const currentIndex = PRODUCTION_STAGES.indexOf(
    currentStatus as (typeof PRODUCTION_STAGES)[number]
  );

  // Only show for production-phase orders
  if (currentIndex < 0) return null;

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex min-w-[500px] items-center justify-between px-2 py-4">
        {PRODUCTION_STAGES.map((stage, index) => {
          const config = getStatusConfig(stage);
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div
              key={stage}
              className="flex flex-1 items-center last:flex-none"
            >
              {/* Dot */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium transition-all",
                    isCompleted &&
                      "border-primary bg-primary text-primary-foreground",
                    isCurrent &&
                      "border-primary bg-primary/10 text-primary animate-pulse",
                    !isCompleted &&
                      !isCurrent &&
                      "border-muted-foreground/30 text-muted-foreground/50"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span
                  className={cn(
                    "mt-1.5 text-center text-[10px] leading-tight",
                    isCurrent
                      ? "text-primary font-semibold"
                      : "text-muted-foreground"
                  )}
                >
                  {config.label}
                </span>
              </div>

              {/* Connector line */}
              {index < PRODUCTION_STAGES.length - 1 && (
                <div
                  className={cn(
                    "mx-1 h-0.5 flex-1",
                    index < currentIndex
                      ? "bg-primary"
                      : "bg-muted-foreground/20"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
