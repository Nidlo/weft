import { gql } from "@apollo/client/core";

export const GENERATE_STYLE_PROFILE = gql`
  mutation GenerateStyleProfile($measurementId: ID!) {
    generateStyleProfile(measurementId: $measurementId) {
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
