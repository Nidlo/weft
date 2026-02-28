import { gql } from "@apollo/client/core";

const EXTERNAL_PAYMENT_FIELDS = `
  id
  orderId
  recordedBy
  confirmedBy
  amount
  method
  methodLabel
  status
  statusLabel
  paidAt
  notes
  rejectionReason
  proofImages
  createdAt
`;

export const RECORD_EXTERNAL_PAYMENT = gql`
  mutation RecordExternalPayment($input: RecordExternalPaymentInput!) {
    recordExternalPayment(input: $input) {
      ${EXTERNAL_PAYMENT_FIELDS}
    }
  }
`;

export const CONFIRM_EXTERNAL_PAYMENT = gql`
  mutation ConfirmExternalPayment($externalPaymentId: ID!) {
    confirmExternalPayment(externalPaymentId: $externalPaymentId) {
      ${EXTERNAL_PAYMENT_FIELDS}
    }
  }
`;

export const REJECT_EXTERNAL_PAYMENT = gql`
  mutation RejectExternalPayment($externalPaymentId: ID!, $reason: String) {
    rejectExternalPayment(externalPaymentId: $externalPaymentId, reason: $reason) {
      ${EXTERNAL_PAYMENT_FIELDS}
    }
  }
`;
