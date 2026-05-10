"use client";

import Image from "next/image";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StarRating } from "./star-rating";
import { DesignerResponseForm } from "./designer-response-form";
import type { GqlReview } from "@/types/graphql";

interface ReviewCardProps {
  review: GqlReview;
  isDesigner?: boolean;
  onResponseSubmitted?: () => void;
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function ReviewCard({
  review,
  isDesigner,
  onResponseSubmitted,
}: ReviewCardProps) {
  const [showResponseForm, setShowResponseForm] = useState(false);

  return (
    <div className="space-y-3 py-4">
      {/* Reviewer info + rating */}
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={review.reviewer.avatarUrl ?? undefined} />
          <AvatarFallback className="text-xs">
            {getInitials(review.reviewer.fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">
              {review.reviewer.fullName ?? "Client"}
            </p>
            <span className="text-muted-foreground text-xs">
              {timeAgo(review.createdAt)}
            </span>
          </div>
          <StarRating value={review.rating} size="sm" />
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-foreground/90 text-sm">{review.comment}</p>
      )}

      {/* Photos */}
      {review.photos && review.photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {review.photos.map((photo, i) => (
            <a
              key={i}
              href={photo.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open review photo ${i + 1} full size`}
              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg"
            >
              <Image
                src={photo.thumbnail_url}
                alt={`Review photo ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover transition-transform hover:scale-105"
              />
            </a>
          ))}
        </div>
      )}

      {/* Designer response */}
      {review.designerResponse && (
        <div className="border-muted border-l-2 pl-3">
          <p className="text-muted-foreground text-xs font-medium">
            Designer Response
          </p>
          <p className="mt-0.5 text-sm">{review.designerResponse}</p>
        </div>
      )}

      {/* Reply button — designer only, no existing response */}
      {isDesigner && !review.designerResponse && !showResponseForm && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowResponseForm(true)}
        >
          Reply
        </Button>
      )}

      {/* Inline response form */}
      {showResponseForm && (
        <DesignerResponseForm
          reviewId={review.id}
          onSuccess={() => {
            setShowResponseForm(false);
            onResponseSubmitted?.();
          }}
          onCancel={() => setShowResponseForm(false)}
        />
      )}
    </div>
  );
}
