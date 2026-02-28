import { gql } from "@apollo/client/core";

export const SUBMIT_REVIEW = gql`
  mutation SubmitReview($input: SubmitReviewInput!) {
    submitReview(input: $input) {
      id
      orderId
      reviewerId
      designerId
      rating
      comment
      photos
      createdAt
      reviewer {
        id
        firstName
        lastName
        fullName
        avatarUrl
      }
    }
  }
`;

export const RESPOND_TO_REVIEW = gql`
  mutation RespondToReview($reviewId: ID!, $response: String!) {
    respondToReview(reviewId: $reviewId, response: $response) {
      id
      designerResponse
      designerRespondedAt
    }
  }
`;
