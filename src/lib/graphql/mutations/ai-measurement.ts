import { gql } from "@apollo/client/core";

export const EXTRACT_AI_MEASUREMENTS = gql`
  mutation ExtractAiMeasurements(
    $frontImage: Upload!
    $sideImage: Upload
    $heightCm: Float
  ) {
    extractAiMeasurements(
      frontImage: $frontImage
      sideImage: $sideImage
      heightCm: $heightCm
    ) {
      data
      landmarks
      photoUrl
      photoPublicId
    }
  }
`;
