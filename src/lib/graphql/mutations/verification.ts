import { gql } from "@apollo/client/core";

export const UPLOAD_VERIFICATION_DOCUMENT = gql`
  mutation UploadVerificationDocument($file: Upload!, $type: String!) {
    uploadVerificationDocument(file: $file, type: $type) {
      id
      type
      documentUrl
      status
      createdAt
    }
  }
`;

export const DELETE_VERIFICATION_DOCUMENT = gql`
  mutation DeleteVerificationDocument($id: ID!) {
    deleteVerificationDocument(id: $id)
  }
`;
