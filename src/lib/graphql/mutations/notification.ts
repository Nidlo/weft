import { gql } from "@apollo/client/core";

export const REGISTER_FCM_TOKEN = gql`
  mutation RegisterFcmToken($token: String!) {
    registerFcmToken(token: $token)
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      id
      readAt
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;

export const UPDATE_NOTIFICATION_PREFERENCES = gql`
  mutation UpdateNotificationPreferences(
    $input: NotificationPreferencesInput!
  ) {
    updateNotificationPreferences(input: $input) {
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
    }
  }
`;

export const UPDATE_QUIET_HOURS = gql`
  mutation UpdateQuietHours($start: String, $end: String) {
    updateQuietHours(start: $start, end: $end)
  }
`;
