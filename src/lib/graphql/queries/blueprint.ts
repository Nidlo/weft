import { gql } from "@apollo/client/core";

export const GET_BLUEPRINT_OPTIONS = gql`
  query BlueprintOptions {
    blueprintOptions {
      garmentTypes {
        value
        label
      }
      occasions {
        value
        label
      }
      designFields
      garmentFields
      fabricTypes {
        value
        label
      }
      measurementFields
    }
  }
`;
