import { gql } from "@apollo/client/core";

export const MY_ORDERS = gql`
  query MyOrders($status: String, $first: Int, $page: Int) {
    myOrders(status: $status, first: $first, page: $page) {
      data {
        id
        clientId
        designerId
        blueprint
        status
        budgetMin
        budgetMax
        counterPrice
        confirmedPrice
        deadline
        isRush
        isInternal
        clientPhone
        clientName
        clientDisplayName
        hasLinkedClient
        notes
        createdAt
        client {
          id
          firstName
          lastName
          fullName
          avatarUrl
        }
        designer {
          id
          firstName
          lastName
          fullName
          avatarUrl
        }
        paymentSummary {
          depositStatus
          balanceStatus
          depositAmount
          balanceAmount
          totalPaidGateway
          totalPaidExternal
          totalPaid
          amountRemaining
          depositOwed
          balanceOwed
          isFullyPaid
        }
      }
      paginatorInfo {
        count
        hasMorePages
      }
    }
  }
`;

export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      clientId
      designerId
      measurementId
      blueprint
      status
      budgetMin
      budgetMax
      counterPrice
      counterMessage
      declineReason
      confirmedPrice
      deadline
      deadlineStart
      isRush
      isInternal
      clientPhone
      clientName
      clientDisplayName
      hasLinkedClient
      notes
      deliveredAt
      cancelledAt
      cancelReason
      createdAt
      client {
        id
        firstName
        lastName
        fullName
        avatarUrl
      }
      designer {
        id
        firstName
        lastName
        fullName
        avatarUrl
        designerProfile {
          displayName
          slug
        }
      }
      measurement {
        id
        label
        unit
        data
        source
        isDefault
      }
      updates {
        id
        fromStatus
        toStatus
        notes
        photos
        updatedBy {
          id
          fullName
        }
        createdAt
      }
      materials {
        id
        name
        unitCost
        quantity
        totalCost
        isPurchased
        createdAt
      }
      payments {
        id
        orderId
        payerId
        amount
        currency
        type
        method
        status
        reference
        paidAt
        createdAt
      }
      payouts {
        id
        paymentId
        designerId
        orderId
        grossAmount
        platformFee
        feeRate
        netAmount
        provider
        status
        reference
        recipientPhone
        recipientNetwork
        transferredAt
        createdAt
      }
      externalPayments {
        id
        orderId
        recordedBy
        confirmedBy
        amount
        method
        methodLabel
        status
        statusLabel
        paidAt
        notes
        rejectionReason
        proofImages
        createdAt
      }
      paymentSummary {
        depositStatus
        balanceStatus
        depositAmount
        balanceAmount
      }
      conversation {
        id
      }
      review {
        id
        orderId
        reviewerId
        designerId
        rating
        comment
        photos
        designerResponse
        designerRespondedAt
        createdAt
        reviewer {
          id
          firstName
          lastName
          fullName
          avatarUrl
        }
      }
    }
  }
`;

export const ORDER_TIMELINE = gql`
  query OrderTimeline($orderId: ID!) {
    orderTimeline(orderId: $orderId) {
      id
      fromStatus
      toStatus
      notes
      photos
      updatedBy {
        id
        fullName
      }
      createdAt
    }
  }
`;

export const SEARCH_CLIENTS = gql`
  query SearchClients($query: String!, $first: Int) {
    searchClients(query: $query, first: $first) {
      id
      fullName
      phone
      avatarUrl
      city
    }
  }
`;

export const CLIENT_MEASUREMENTS = gql`
  query ClientMeasurements($clientId: ID!) {
    clientMeasurements(clientId: $clientId) {
      id
      label
      unit
      data
      source
      isDefault
      createdAt
    }
  }
`;

export const ORDER_PROFIT_SUMMARY = gql`
  query OrderProfitSummary($orderId: ID!) {
    orderProfitSummary(orderId: $orderId) {
      totalMaterialCost
      confirmedPrice
      profit
      marginPercent
      materialCount
      purchasedCount
    }
  }
`;
