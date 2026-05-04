import { gql } from "@apollo/client/core";

export const MY_NOTIFICATIONS = gql`
  query MyNotifications($first: Int, $page: Int) {
    myNotifications(first: $first, page: $page) {
      data {
        id
        type
        typeLabel
        typeIcon
        title
        body
        data
        actionUrl
        readAt
        createdAt
      }
      paginatorInfo {
        count
        hasMorePages
        endCursor
      }
    }
  }
`;

export const UNREAD_NOTIFICATIONS_COUNT = gql`
  query UnreadNotificationsCount {
    unreadNotificationsCount
  }
`;

export const MY_NOTIFICATION_PREFERENCES = gql`
  query MyNotificationPreferences {
    myNotificationPreferences {
      orderCreated {
        push
        sms
      }
      orderStatusChanged {
        push
        sms
      }
      messageReceived {
        push
        sms
      }
      paymentReceived {
        push
        sms
      }
      paymentConfirmed {
        push
        sms
      }
      reviewReceived {
        push
        sms
      }
      payoutProcessed {
        push
        sms
      }
      externalPaymentRecorded {
        push
        sms
      }
      quietHoursStart
      quietHoursEnd
    }
  }
`;
