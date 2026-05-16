import { gql } from "@apollo/client/core";

export const MY_BLUEPRINT_DRAFTS = gql`
  query MyBlueprintDrafts($status: String) {
    myBlueprintDrafts(status: $status) {
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
      client {
        id
        fullName
      }
      designer {
        id
        fullName
      }
      initiator {
        id
        fullName
      }
    }
  }
`;

export const BLUEPRINT_DRAFT_DETAIL = gql`
  query BlueprintDraftDetail($id: ID!) {
    blueprintDraft(id: $id) {
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
      client {
        id
        fullName
      }
      designer {
        id
        fullName
      }
      initiator {
        id
        fullName
      }
      convertedOrder {
        id
        status
      }
      revisions {
        id
        authorId
        authorRole
        blueprint
        budgetMin
        budgetMax
        proposedDeadline
        message
        createdAt
        author {
          id
          fullName
        }
      }
    }
  }
`;
