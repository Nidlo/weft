import { gql } from "@apollo/client/core";

export const MY_STYLE_PROFILE = gql`
  query MyStyleProfile {
    myStyleProfile {
      bodyShape
      bodyShapeConfidence
      flatteringSilhouettes
      colorPalette
      fabricRecommendations
      recommendedSpecializations
      summary
      fromFallback
      generatedAt
    }
  }
`;
