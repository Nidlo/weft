"use client";

import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getStatusConfig } from "@/lib/utils/order";
import type { GqlOrderUpdate } from "@/types/graphql";

interface OrderTimelineProps {
  updates: GqlOrderUpdate[];
}

export function OrderTimeline({ updates }: OrderTimelineProps) {
  if (updates.length === 0) {
    return (
      <p className="text-muted-foreground py-4 text-center text-sm">
        No updates yet.
      </p>
    );
  }

  // Most recent first
  const sorted = [...updates].reverse();

  return (
    <div className="space-y-0">
      {sorted.map((update, index) => {
        const toConfig = getStatusConfig(update.toStatus);
        const isLast = index === sorted.length - 1;

        return (
          <div key={update.id} className="flex gap-3">
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
              <div
                className={`h-3 w-3 shrink-0 rounded-full ${toConfig.bgColor} ring-background ring-2`}
              />
              {!isLast && <div className="bg-border w-px flex-1" />}
            </div>

            {/* Content */}
            <div className="pb-6">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${toConfig.color}`}>
                  {toConfig.label}
                </span>
                <span className="text-muted-foreground text-xs">
                  {new Date(update.createdAt).toLocaleDateString("en-GH", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {update.notes && (
                <p className="text-muted-foreground mt-1 text-sm">
                  {update.notes}
                </p>
              )}

              {update.photos && update.photos.length > 0 && (
                <div className="mt-2 flex gap-2 overflow-x-auto">
                  {update.photos.map((url, i) => (
                    <div
                      key={i}
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md"
                    >
                      <Image
                        src={url}
                        alt={`Update photo ${i + 1}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-1 flex items-center gap-1.5">
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="text-[8px]">
                    {update.updatedBy.fullName?.charAt(0) ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-muted-foreground text-xs">
                  {update.updatedBy.fullName}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
