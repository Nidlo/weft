import { gql } from "@apollo/client/core";

export const ME_QUERY = gql`
  query Me {
    me {
      id
      firstName
      lastName
      otherNames
      fullName
      heightCm
      phone
      email
      avatarUrl
      city
      isVerified
      isDesigner
      isOnboarded
      isImpersonated
      impersonatorEmail
      termsAcceptedVersion
      designerProfile {
        slug
        profileViewsCount
        profileViewsThisWeek
      }
    }
  }
`;

export const LEGAL_VERSIONS = gql`
  query LegalVersions {
    legalVersions {
      termsVersion
      privacyVersion
    }
  }
`;
