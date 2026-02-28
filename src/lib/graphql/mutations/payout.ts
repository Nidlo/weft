import { gql } from "@apollo/client/core";

export const REQUEST_PAYOUT = gql`
  mutation RequestPayout($payoutId: ID!) {
    requestPayout(payoutId: $payoutId) {
      id
      status
      reference
      netAmount
      provider
      createdAt
    }
  }
`;
