import { gql } from "@apollo/client/core";

export const REQUEST_OTP = gql`
  mutation RequestOtp($phone: String!) {
    requestOtp(phone: $phone) {
      success
      message
    }
  }
`;

export const VERIFY_OTP = gql`
  mutation VerifyOtp($phone: String!, $code: String!) {
    verifyOtp(phone: $phone, code: $code) {
      token
      isNew
      user {
        id
        firstName
        lastName
        fullName
        phone
        email
        avatarUrl
        city
        isVerified
        isDesigner
        isOnboarded
      }
    }
  }
`;

export const SOCIAL_LOGIN = gql`
  mutation SocialLogin($provider: String!, $token: String!) {
    socialLogin(provider: $provider, token: $token) {
      token
      isNew
      user {
        id
        firstName
        lastName
        fullName
        phone
        email
        avatarUrl
        city
        isVerified
        isDesigner
        isOnboarded
      }
    }
  }
`;

export const BECOME_DESIGNER = gql`
  mutation BecomeDesigner {
    becomeDesigner {
      id
      isDesigner
      designerProfile {
        id
      }
    }
  }
`;

export const COMPLETE_ONBOARDING = gql`
  mutation CompleteOnboarding {
    completeOnboarding {
      id
      isOnboarded
      onboardedAt
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;
