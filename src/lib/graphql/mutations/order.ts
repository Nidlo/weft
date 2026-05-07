import { gql } from "@apollo/client/core";

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      clientId
      designerId
      measurementId
      blueprint
      status
      budgetMin
      budgetMax
      deadline
      isRush
      notes
      createdAt
    }
  }
`;

export const UPLOAD_REFERENCE_IMAGE = gql`
  mutation UploadReferenceImage($file: Upload!) {
    uploadReferenceImage(file: $file) {
      url
      thumbnailUrl
    }
  }
`;

export const CREATE_INTERNAL_ORDER = gql`
  mutation CreateInternalOrder($input: CreateInternalOrderInput!) {
    createInternalOrder(input: $input) {
      id
      clientId
      designerId
      measurementId
      blueprint
      status
      isInternal
      budgetMin
      budgetMax
      confirmedPrice
      clientPhone
      clientName
      hasLinkedClient
      deadline
      deadlineStart
      isRush
      notes
      createdAt
    }
  }
`;

export const UPDATE_ORDER = gql`
  mutation UpdateOrder($input: UpdateOrderInput!) {
    updateOrder(input: $input) {
      id
      clientId
      designerId
      measurementId
      blueprint
      status
      budgetMin
      budgetMax
      confirmedPrice
      deadline
      deadlineStart
      notes
      clientPhone
      clientName
      clientDisplayName
      hasLinkedClient
      isInternal
      createdAt
    }
  }
`;

export const CREATE_BLUEPRINT_OPTION = gql`
  mutation CreateBlueprintOption($category: String!, $value: String!, $label: String!) {
    createBlueprintOption(category: $category, value: $value, label: $label) {
      value
      label
    }
  }
`;

export const RESPOND_TO_ORDER = gql`
  mutation RespondToOrder($input: RespondToOrderInput!) {
    respondToOrder(input: $input) {
      id
      status
      counterPrice
      counterMessage
      confirmedPrice
      declineReason
    }
  }
`;

export const CONFIRM_ORDER = gql`
  mutation ConfirmOrder($orderId: ID!) {
    confirmOrder(orderId: $orderId) {
      id
      status
      confirmedPrice
    }
  }
`;

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($input: UpdateOrderStatusInput!) {
    updateOrderStatus(input: $input) {
      id
      status
    }
  }
`;

export const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: ID!, $reason: String) {
    cancelOrder(orderId: $orderId, reason: $reason) {
      id
      status
      cancelReason
      cancelledAt
    }
  }
`;

export const CONFIRM_DELIVERY = gql`
  mutation ConfirmDelivery($orderId: ID!) {
    confirmDelivery(orderId: $orderId) {
      id
      status
      deliveredAt
    }
  }
`;

export const ADD_MATERIAL = gql`
  mutation AddMaterial($input: AddMaterialInput!) {
    addMaterial(input: $input) {
      id
      name
      unitCost
      quantity
      totalCost
      isPurchased
    }
  }
`;

export const TOGGLE_PURCHASED = gql`
  mutation TogglePurchased($materialId: ID!) {
    togglePurchased(materialId: $materialId) {
      id
      isPurchased
    }
  }
`;

export const REMOVE_MATERIAL = gql`
  mutation RemoveMaterial($materialId: ID!) {
    removeMaterial(materialId: $materialId)
  }
`;

export const SET_ORDER_GARMENT_EASE = gql`
  mutation SetOrderGarmentEase($input: SetOrderGarmentEaseInput!) {
    setOrderGarmentEase(input: $input) {
      id
      orderId
      section
      field
      deltaMm
      note
      createdBy {
        id
        fullName
      }
      createdAt
      updatedAt
    }
  }
`;

export const CLEAR_ORDER_GARMENT_EASE = gql`
  mutation ClearOrderGarmentEase(
    $orderId: ID!
    $section: String!
    $field: String!
  ) {
    clearOrderGarmentEase(orderId: $orderId, section: $section, field: $field)
  }
`;
