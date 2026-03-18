import { gql } from "@apollo/client/core";

export const MY_VERIFICATION_DOCUMENTS = gql`
  query MyVerificationDocuments {
    myVerificationDocuments {
      id
      type
      documentUrl
      status
      rejectionReason
      reviewedAt
      createdAt
    }
  }
`;
