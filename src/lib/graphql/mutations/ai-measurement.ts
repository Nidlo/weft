import { gql } from "@apollo/client/core";

/**
 * Sprint 33a — the mutation is now a dispatcher that returns a job row
 * with `status="queued"`. The FE polls the `measurementScanJob` query
 * (below) every ~3s until a terminal status, then projects `result` into
 * the existing AiFlow review step. The field shape of `result` is
 * identical to the old sync mutation's `ExtractAiMeasurementsResult` so
 * the downstream ManualForm wiring stays unchanged.
 */
export const EXTRACT_AI_MEASUREMENTS = gql`
  mutation ExtractAiMeasurements(
    $frontImage: Upload!
    $sideImage: Upload
    $heightCm: Float
    $referenceObjectCm: Float
    $useEstimatedHeight: Boolean
  ) {
    extractAiMeasurements(
      frontImage: $frontImage
      sideImage: $sideImage
      heightCm: $heightCm
      referenceObjectCm: $referenceObjectCm
      useEstimatedHeight: $useEstimatedHeight
    ) {
      id
      status
    }
  }
`;

export const MEASUREMENT_SCAN_JOB = gql`
  query MeasurementScanJob($id: ID!) {
    measurementScanJob(id: $id) {
      id
      status
      errorCategory
      errorMessage
      result {
        data
        landmarks
        photoUrl
        photoPublicId
        photoDisk
        degradedModes
      }
    }
  }
`;
