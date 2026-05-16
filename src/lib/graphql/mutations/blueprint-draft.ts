import { gql } from "@apollo/client/core";

const DRAFT_FIELDS = `
  id
  initiatorId
  initiatorRole
  clientId
  designerId
  blueprint
  budgetMin
  budgetMax
  proposedDeadline
  status
  currentTurn
  convertedOrderId
  createdAt
  updatedAt
`;

export const CREATE_BLUEPRINT_DRAFT = gql`
  mutation CreateBlueprintDraft($input: CreateBlueprintDraftInput!) {
    createBlueprintDraft(input: $input) {
      ${DRAFT_FIELDS}
    }
  }
`;

export const REVISE_BLUEPRINT_DRAFT = gql`
  mutation ReviseBlueprintDraft($input: ReviseBlueprintDraftInput!) {
    reviseBlueprintDraft(input: $input) {
      ${DRAFT_FIELDS}
    }
  }
`;

export const ACCEPT_BLUEPRINT_DRAFT = gql`
  mutation AcceptBlueprintDraft($draftId: ID!) {
    acceptBlueprintDraft(draftId: $draftId) {
      ${DRAFT_FIELDS}
    }
  }
`;

export const CONVERT_BLUEPRINT_DRAFT_TO_ORDER = gql`
  mutation ConvertBlueprintDraftToOrder($draftId: ID!) {
    convertBlueprintDraftToOrder(draftId: $draftId) {
      id
      status
      clientId
      designerId
    }
  }
`;

export const CLOSE_BLUEPRINT_DRAFT = gql`
  mutation CloseBlueprintDraft($draftId: ID!, $action: String!) {
    closeBlueprintDraft(draftId: $draftId, action: $action) {
      id
      status
    }
  }
`;
