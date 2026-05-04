import { gql } from "@apollo/client/core";

export const SEARCH_DESIGNERS = gql`
  query SearchDesigners(
    $input: SearchDesignersInput
    $first: Int
    $after: String
  ) {
    designers(input: $input, first: $first, after: $after) {
      data {
        id
        firstName
        lastName
        fullName
        displayName
        slug
        avatarUrl
        city
        specializations
        pricingMin
        pricingMax
        ratingAvg
        totalReviews
        ordersCompleted
        isAcceptingOrders
        profileCompleteness
        distance
      }
      paginatorInfo {
        count
        hasMorePages
        endCursor
      }
    }
  }
`;

export const GET_DESIGNER = gql`
  query GetDesigner($slug: String!) {
    designer(slug: $slug) {
      id
      firstName
      lastName
      fullName
      avatarUrl
      city
      countryCode
      isVerified
      isDesigner
      isOnboarded
      designerProfile {
        id
        displayName
        slug
        bio
        specializations
        pricingMin
        pricingMax
        portfolioImages
        equipment
        ratingAvg
        totalReviews
        ordersCompleted
        onTimeRate
        responseTimeAvg
        isAcceptingOrders
        profileCompleteness
      }
    }
  }
`;

export const GET_SPECIALIZATIONS = gql`
  query GetSpecializations {
    specializations {
      id
      name
      slug
      isQuickFilter
    }
  }
`;

export const GET_CITIES = gql`
  query GetCities($countryCode: String) {
    cities(countryCode: $countryCode) {
      id
      name
      countryCode
    }
  }
`;

export const GET_FASHION_INTERESTS = gql`
  query GetFashionInterests($category: String) {
    fashionInterests(category: $category) {
      id
      name
      slug
      category
      isDefault
    }
  }
`;

export const GET_COUNTRIES = gql`
  query GetCountries($activeOnly: Boolean) {
    countries(activeOnly: $activeOnly) {
      id
      name
      iso2
      phoneCode
      emoji
      currency
      currencySymbol
      isActive
      phoneDigits
      phoneStartsWithZero
      phonePlaceholder
    }
  }
`;
