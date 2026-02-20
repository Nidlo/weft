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
        name
        phone
        email
        role
        avatarUrl
        city
        isVerified
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
        name
        phone
        email
        role
        avatarUrl
        city
        isVerified
      }
    }
  }
`;

export const SELECT_ROLE = gql`
  mutation SelectRole($role: UserRole!) {
    selectRole(role: $role) {
      id
      name
      role
      profile {
        id
      }
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;
