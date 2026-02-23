import { gql } from "@apollo/client/core";

export const MY_MEASUREMENTS = gql`
  query MyMeasurements {
    myMeasurements {
      id
      label
      unit
      data
      source
      isDefault
      createdAt
      updatedAt
    }
  }
`;
