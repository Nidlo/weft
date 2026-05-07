import { gql } from "@apollo/client/core";

export const MY_MEASUREMENTS = gql`
  query MyMeasurements {
    myMeasurements {
      id
      label
      dataMm
      aiBaselineMm
      manualOverridesMm
      landmarksNormalized
      photoUrl
      photoDisk
      confirmedAt
      source
      isDefault
      createdAt
      updatedAt
    }
  }
`;

export const MEASUREMENT_HISTORY = gql`
  query MeasurementHistory($measurementId: ID!) {
    measurementHistory(measurementId: $measurementId) {
      id
      sourceKind
      dataMm
      notes
      recordedAt
    }
  }
`;
