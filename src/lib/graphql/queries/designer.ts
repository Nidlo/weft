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

// Owner-scoped designer profile for the edit screen. NOT slug-keyed:
// /profile/edit must hydrate from the authenticated owner's own record,
// never the public designer(slug:) path - a null/stale slug would
// otherwise silently blank the whole form (designer fields, studio,
// portfolio) and hide the view-as-client link. The `me` resolver
// returns the full unscrubbed profile for the owner (self).
export const MY_DESIGNER_PROFILE = gql`
  query MyDesignerProfile {
    me {
      id
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
        isAcceptingOrders
        workshopName
        workshopAddress
        workshopLat
        workshopLng
        profileCompleteness
        publicVisibility
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
        workshopName
        workshopAddress
        workshopLat
        workshopLng
        profileCompleteness
        publicVisibility
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
