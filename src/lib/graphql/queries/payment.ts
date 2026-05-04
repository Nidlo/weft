import { gql } from "@apollo/client/core";

export const PAYMENT_STATUS = gql`
  query PaymentStatus($reference: String!) {
    paymentStatus(reference: $reference) {
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
      refundedAt
      refundReason
      createdAt
    }
  }
`;

export const ORDER_PAYMENTS = gql`
  query OrderPayments($orderId: ID!) {
    orderPayments(orderId: $orderId) {
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
      refundedAt
      refundReason
      createdAt
    }
  }
`;
