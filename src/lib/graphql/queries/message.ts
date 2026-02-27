import { gql } from "@apollo/client/core";

export const MY_CONVERSATIONS = gql`
  query MyConversations {
    myConversations {
      id
      orderId
      designerId
      clientId
      lastMessageAt
      order {
        id
        blueprint
        status
      }
      designer {
        id
        firstName
        lastName
        fullName
        avatarUrl
      }
      client {
        id
        firstName
        lastName
        fullName
        avatarUrl
      }
      latestMessage {
        id
        body
        mediaUrl
        mediaType
        senderId
        createdAt
      }
      unreadCount
    }
  }
`;

export const CONVERSATION_MESSAGES = gql`
  query ConversationMessages(
    $conversationId: ID!
    $before: String
    $first: Int
  ) {
    conversationMessages(
      conversationId: $conversationId
      before: $before
      first: $first
    ) {
      data {
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
      hasMore
      nextCursor
    }
  }
`;

export const UNREAD_MESSAGES_COUNT = gql`
  query UnreadMessagesCount {
    unreadMessagesCount
  }
`;
