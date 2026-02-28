import { gql } from "@apollo/client/core";

export const DESIGNER_REVIEWS = gql`
  query DesignerReviews($designerId: ID!, $first: Int, $page: Int) {
    designerReviews(designerId: $designerId, first: $first, page: $page) {
      data {
        id
        orderId
        reviewerId
        designerId
        rating
        comment
        photos
        designerResponse
        designerRespondedAt
        createdAt
        reviewer {
          id
          firstName
          lastName
          fullName
          avatarUrl
        }
      }
      paginatorInfo {
        count
        hasMorePages
      }
    }
  }
`;

export const RATING_BREAKDOWN = gql`
  query RatingBreakdown($designerId: ID!) {
    ratingBreakdown(designerId: $designerId) {
      five
      four
      three
      two
      one
    }
  }
`;
