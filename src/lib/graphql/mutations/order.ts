import { gql } from "@apollo/client/core";

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      clientId
      designerId
      measurementId
      blueprint
      status
      budgetMin
      budgetMax
      deadline
      isRush
      notes
      createdAt
    }
  }
`;

export const UPLOAD_REFERENCE_IMAGE = gql`
  mutation UploadReferenceImage($file: Upload!) {
    uploadReferenceImage(file: $file) {
      url
      thumbnailUrl
    }
  }
`;
