"use client";

import { Star } from "lucide-react";
import type { GqlRatingBreakdown } from "@/types/graphql";

interface RatingBreakdownProps {
  breakdown: GqlRatingBreakdown;
  averageRating: number;
  totalReviews: number;
}

export function RatingBreakdown({
  breakdown,
  averageRating,
  totalReviews,
}: RatingBreakdownProps) {
  const bars = [
    { stars: 5, count: breakdown.five },
    { stars: 4, count: breakdown.four },
    { stars: 3, count: breakdown.three },
    { stars: 2, count: breakdown.two },
    { stars: 1, count: breakdown.one },
  ];

  const max = Math.max(...bars.map((b) => b.count), 1);

  return (
    <div className="flex gap-6">
      {/* Average */}
      <div className="flex flex-col items-center justify-center">
        <p className="text-4xl font-bold">{averageRating.toFixed(1)}</p>
        <div className="mt-1 flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`h-3.5 w-3.5 ${
                s <= Math.round(averageRating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/30 fill-none"
              }`}
            />
          ))}
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          {totalReviews} reviews
        </p>
      </div>

      {/* Bars */}
      <div className="flex flex-1 flex-col gap-1.5">
        {bars.map(({ stars, count }) => (
          <div key={stars} className="flex items-center gap-2">
            <span className="text-muted-foreground w-4 text-right text-xs">
              {stars}
            </span>
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <div className="bg-muted relative h-2 flex-1 overflow-hidden rounded-full">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-yellow-400 transition-all"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
            <span className="text-muted-foreground w-6 text-right text-xs">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
