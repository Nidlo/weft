import { gql } from "@apollo/client/core";

export const UPDATE_MY_INFO = gql`
  mutation UpdateMyInfo($input: UpdateMyInfoInput!) {
    updateMyInfo(input: $input) {
      id
      firstName
      lastName
      otherNames
      fullName
      email
      city
      region
      countryCode
      locationLat
      locationLng
      addressLine
      postalCode
      formattedAddress
      avatarUrl
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      displayName
      slug
      bio
      specializations
      pricingMin
      pricingMax
      equipment
      isAcceptingOrders
      workshopName
      workshopAddress
      workshopLat
      workshopLng
      profileCompleteness
      publicVisibility
    }
  }
`;

export const UPDATE_AVATAR = gql`
  mutation UpdateAvatar($file: Upload!) {
    updateAvatar(file: $file) {
      id
      avatarUrl
    }
  }
`;

export const ADD_PORTFOLIO_IMAGE = gql`
  mutation AddPortfolioImage($file: Upload!, $caption: String) {
    addPortfolioImage(file: $file, caption: $caption) {
      id
      portfolioImages
      profileCompleteness
    }
  }
`;

export const REMOVE_PORTFOLIO_IMAGE = gql`
  mutation RemovePortfolioImage($index: Int!) {
    removePortfolioImage(index: $index) {
      id
      portfolioImages
      profileCompleteness
    }
  }
`;

export const REORDER_PORTFOLIO_IMAGES = gql`
  mutation ReorderPortfolioImages($order: [Int!]!) {
    reorderPortfolioImages(order: $order) {
      id
      portfolioImages
    }
  }
`;

export const TRACK_PROFILE_VIEW = gql`
  mutation TrackProfileView($slug: String!) {
    trackProfileView(slug: $slug)
  }
`;
