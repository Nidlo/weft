import { gql } from "@apollo/client/core";

export const CREATE_MEASUREMENT = gql`
  mutation CreateMeasurement($input: CreateMeasurementInput!) {
    createMeasurement(input: $input) {
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

export const UPDATE_MEASUREMENT = gql`
  mutation UpdateMeasurement($id: ID!, $input: UpdateMeasurementInput!) {
    updateMeasurement(id: $id, input: $input) {
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

export const RESET_MEASUREMENT_FIELD = gql`
  mutation ResetMeasurementField($id: ID!, $section: String!, $field: String!) {
    resetMeasurementField(id: $id, section: $section, field: $field) {
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
      updatedAt
    }
  }
`;

export const APPLY_MEASUREMENT_RESCAN = gql`
  mutation ApplyMeasurementRescan($id: ID!, $input: ApplyRescanInput!) {
    applyMeasurementRescan(id: $id, input: $input) {
      measurement {
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
        updatedAt
      }
      deltas {
        section
        field
        baselineMm
        proposedMm
        deltaMm
        tier
      }
      applied {
        section
        field
      }
      rejected {
        section
        field
      }
    }
  }
`;
