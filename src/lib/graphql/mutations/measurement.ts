import { gql } from "@apollo/client/core";

export const CREATE_MEASUREMENT = gql`
  mutation CreateMeasurement($input: CreateMeasurementInput!) {
    createMeasurement(input: $input) {
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

export const UPDATE_MEASUREMENT = gql`
  mutation UpdateMeasurement($id: ID!, $input: UpdateMeasurementInput!) {
    updateMeasurement(id: $id, input: $input) {
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

export const DELETE_MEASUREMENT = gql`
  mutation DeleteMeasurement($id: ID!) {
    deleteMeasurement(id: $id)
  }
`;

export const SET_DEFAULT_MEASUREMENT = gql`
  mutation SetDefaultMeasurement($id: ID!) {
    setDefaultMeasurement(id: $id) {
      id
      label
      isDefault
    }
  }
`;
