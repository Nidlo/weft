import { gql } from "@apollo/client/core";

export const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      conversationId
      senderId
      body
      mediaUrl
      mediaType
      readAt
      createdAt
      sender {
        id
        firstName
        lastName
        fullName
        avatarUrl
      }
    }
  }
`;

export const MARK_MESSAGES_READ = gql`
  mutation MarkMessagesRead($conversationId: ID!) {
    markMessagesRead(conversationId: $conversationId)
  }
`;

export const START_CONVERSATION = gql`
  mutation StartConversation($orderId: ID!) {
    startConversation(orderId: $orderId) {
      id
    }
  }
`;
