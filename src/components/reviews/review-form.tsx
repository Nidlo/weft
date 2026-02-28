"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { StarRating } from "./star-rating";
import { ReviewPhotoUpload } from "./review-photo-upload";
import { useSubmitReview } from "@/lib/hooks/use-reviews";
import { toast } from "sonner";

const MAX_COMMENT = 1000;

interface ReviewFormProps {
  orderId: string;
  onSuccess: () => void;
  onSkip?: () => void;
}

export function ReviewForm({ orderId, onSuccess, onSkip }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const { submitReview, loading } = useSubmitReview();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }

    try {
      await submitReview(
        orderId,
        rating,
        comment.trim() || undefined,
        photos.length > 0 ? photos : undefined,
      );
      toast.success("Review submitted! Thank you for your feedback.");
      onSuccess();
    } catch {
      toast.error("Failed to submit review. Please try again.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Star Rating */}
      <div className="space-y-2 text-center">
        <p className="text-sm font-medium">How was your experience?</p>
        <StarRating value={rating} onChange={setRating} size="lg" showLabel />
      </div>

      {/* Comment */}
      <div className="space-y-1.5">
        <Textarea
          placeholder="Share your experience (optional)..."
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT))}
          rows={3}
        />
        <p className="text-right text-xs text-muted-foreground">
          {comment.length}/{MAX_COMMENT}
        </p>
      </div>

      {/* Photo Upload */}
      <ReviewPhotoUpload files={photos} onChange={setPhotos} />

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={loading || rating === 0}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </Button>
        {onSkip && (
          <Button variant="ghost" onClick={onSkip} disabled={loading}>
            Skip
          </Button>
        )}
      </div>
    </div>
  );
}
