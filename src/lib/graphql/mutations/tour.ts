import { gql } from "@apollo/client/core";

export const MARK_TOUR_COMPLETED = gql`
  mutation MarkTourCompleted($tour: String!, $outcome: String!) {
    markTourCompleted(tour: $tour, outcome: $outcome) {
      id
      tourProgress
    }
  }
`;
