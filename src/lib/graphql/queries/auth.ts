import { gql } from "@apollo/client/core";

export const ME_QUERY = gql`
  query Me {
    me {
      id
      firstName
      lastName
      otherNames
      fullName
      phone
      email
      avatarUrl
      city
      isVerified
      isDesigner
      isOnboarded
      designerProfile {
        slug
        profileViewsCount
        profileViewsThisWeek
      }
    }
  }
`;
