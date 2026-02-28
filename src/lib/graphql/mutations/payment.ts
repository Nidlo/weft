import { gql } from "@apollo/client/core";

export const INITIATE_PAYMENT = gql`
  mutation InitiatePayment($input: InitiatePaymentInput!) {
    initiatePayment(input: $input) {
      payment {
        id
        orderId
        payerId
        amount
        currency
        type
        method
        status
        reference
        provider
        paidAt
        createdAt
      }
      authorizationUrl
      isMomo
      requiresOtp
      sessionId
    }
  }
`;
