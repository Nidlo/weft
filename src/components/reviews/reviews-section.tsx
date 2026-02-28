"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useDesignerReviews, useRatingBreakdown } from "@/lib/hooks/use-reviews";
import { RatingBreakdown } from "./rating-breakdown";
import { ReviewCard } from "./review-card";

interface ReviewsSectionProps {
  designerId: string;
  averageRating: number;
  totalReviews: number;
  isDesigner?: boolean;
}

export function ReviewsSection({
  designerId,
  averageRating,
  totalReviews,
  isDesigner,
}: ReviewsSectionProps) {
  const { breakdown, loading: breakdownLoading } = useRatingBreakdown(designerId);
  const { reviews, loading, hasMorePages, loadMore } = useDesignerReviews(designerId, 5);

  if (totalReviews === 0) {
    return (
      <div>
        <h2 className="mb-3 text-lg font-semibold">Reviews</h2>
        <p className="text-sm text-muted-foreground">No reviews yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Reviews</h2>

      {/* Rating Breakdown */}
      {breakdown && !breakdownLoading && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <RatingBreakdown
              breakdown={breakdown}
              averageRating={averageRating}
              totalReviews={totalReviews}
            />
          </CardContent>
        </Card>
      )}

      {/* Review List */}
      <div className="divide-y">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            isDesigner={isDesigner}
          />
        ))}
      </div>

      {/* Loading state */}
      {loading && reviews.length === 0 && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Load More */}
      {hasMorePages && (
        <div className="mt-4 text-center">
          <Button variant="outline" size="sm" onClick={loadMore} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Reviews"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
