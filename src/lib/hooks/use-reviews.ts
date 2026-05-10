"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  SUBMIT_REVIEW,
  RESPOND_TO_REVIEW,
} from "@/lib/graphql/mutations/review";
import {
  DESIGNER_REVIEWS,
  RATING_BREAKDOWN,
} from "@/lib/graphql/queries/review";
import { GET_ORDER } from "@/lib/graphql/queries/order";
import type {
  SubmitReviewData,
  RespondToReviewData,
  DesignerReviewsData,
  RatingBreakdownData,
  GqlReview,
} from "@/types/graphql";

export function useSubmitReview() {
  const [mutate, { loading, error }] =
    useMutation<SubmitReviewData>(SUBMIT_REVIEW);

  const submitReview = async (
    orderId: string,
    rating: number,
    comment?: string,
    photos?: File[]
  ): Promise<GqlReview | null> => {
    const result = await mutate({
      variables: {
        input: {
          orderId,
          rating,
          comment: comment || undefined,
          photos: photos?.length ? photos : undefined,
        },
      },
      refetchQueries: [{ query: GET_ORDER, variables: { id: orderId } }],
    });
    return result.data?.submitReview ?? null;
  };

  return { submitReview, loading, error };
}

export function useRespondToReview() {
  const [mutate, { loading, error }] =
    useMutation<RespondToReviewData>(RESPOND_TO_REVIEW);

  const respondToReview = async (reviewId: string, response: string) => {
    const result = await mutate({ variables: { reviewId, response } });
    return result.data?.respondToReview ?? null;
  };

  return { respondToReview, loading, error };
}

export function useDesignerReviews(designerId: string, pageSize = 10) {
  const [page, setPage] = useState(1);

  const { data, loading, error, fetchMore } = useQuery<DesignerReviewsData>(
    DESIGNER_REVIEWS,
    {
      variables: { designerId, first: pageSize, page },
      skip: !designerId,
      fetchPolicy: "cache-and-network",
    }
  );

  const reviews = data?.designerReviews.data ?? [];
  const hasMorePages =
    data?.designerReviews.paginatorInfo.hasMorePages ?? false;

  const loadMore = async () => {
    const nextPage = page + 1;
    await fetchMore({
      variables: { designerId, first: pageSize, page: nextPage },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          designerReviews: {
            ...fetchMoreResult.designerReviews,
            data: [
              ...prev.designerReviews.data,
              ...fetchMoreResult.designerReviews.data,
            ],
          },
        };
      },
    });
    setPage(nextPage);
  };

  return { reviews, loading, error, hasMorePages, loadMore };
}

export function useRatingBreakdown(designerId: string) {
  const { data, loading, error } = useQuery<RatingBreakdownData>(
    RATING_BREAKDOWN,
    {
      variables: { designerId },
      skip: !designerId,
    }
  );

  return {
    breakdown: data?.ratingBreakdown ?? null,
    loading,
    error,
  };
}
