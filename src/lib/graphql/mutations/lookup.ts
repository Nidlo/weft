import { gql } from "@apollo/client/core";

export const CREATE_SPECIALIZATION = gql`
  mutation CreateSpecialization($name: String!) {
    createSpecialization(name: $name) {
      id
      name
      slug
      isQuickFilter
    }
  }
`;

export const CREATE_CITY = gql`
  mutation CreateCity($name: String!, $countryCode: String!) {
    createCity(name: $name, countryCode: $countryCode) {
      id
      name
      countryCode
    }
  }
`;
