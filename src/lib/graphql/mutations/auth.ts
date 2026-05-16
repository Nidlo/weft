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
      isNew
      claimedOrdersCount
      claimedMeasurementsCount
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
        tourProgress
      }
      pendingRestore {
        deletedAt
        expiresAt
        daysRemaining
      }
    }
  }
`;

export const SOCIAL_LOGIN = gql`
  mutation SocialLogin($provider: String!, $token: String!) {
    socialLogin(provider: $provider, token: $token) {
      isNew
      claimedOrdersCount
      claimedMeasurementsCount
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
        tourProgress
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

export const COMPLETE_CLIENT_ONBOARDING = gql`
  mutation CompleteClientOnboarding($input: CompleteClientOnboardingInput!) {
    completeClientOnboarding(input: $input) {
      id
      firstName
      lastName
      fullName
      email
      city
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

export const SIGN_OUT_ALL_DEVICES = gql`
  mutation SignOutAllDevices {
    signOutAllDevices
  }
`;

export const DELETE_MY_ACCOUNT = gql`
  mutation DeleteMyAccount($immediate: Boolean) {
    deleteMyAccount(immediate: $immediate) {
      success
      immediate
      deletedAt
      recoverableUntil
    }
  }
`;

export const RESTORE_ACCOUNT = gql`
  mutation RestoreAccount {
    restoreAccount {
      isNew
      claimedOrdersCount
      claimedMeasurementsCount
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

export const DECLINE_RESTORE = gql`
  mutation DeclineRestore {
    declineRestore
  }
`;

export const ACCEPT_UPDATED_TERMS = gql`
  mutation AcceptUpdatedTerms {
    acceptUpdatedTerms {
      id
      termsAcceptedVersion
    }
  }
`;
