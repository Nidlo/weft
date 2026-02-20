import { gql } from "@apollo/client/core";

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      phone
      email
      role
      avatarUrl
      city
      isVerified
    }
  }
`;
