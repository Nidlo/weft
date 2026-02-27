"use client";

import { useCallback } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  MY_CONVERSATIONS,
  CONVERSATION_MESSAGES,
  UNREAD_MESSAGES_COUNT,
} from "@/lib/graphql/queries/message";
import {
  SEND_MESSAGE,
  MARK_MESSAGES_READ,
  START_CONVERSATION,
} from "@/lib/graphql/mutations/message";
import type {
  MyConversationsData,
  ConversationMessagesData,
  UnreadMessagesCountData,
  SendMessageData,
  SendMessageInput,
  MarkMessagesReadData,
  StartConversationData,
  GqlMessage,
} from "@/types/graphql";

export function useConversations() {
  const { data, loading, error, refetch } =
    useQuery<MyConversationsData>(MY_CONVERSATIONS, {
      fetchPolicy: "cache-and-network",
    });

  return {
    conversations: data?.myConversations ?? [],
    loading,
    error,
    refetch,
  };
}

export function useConversationMessages(
  conversationId: string,
  before?: string | null
) {
  const { data, loading, error, fetchMore, refetch } =
    useQuery<ConversationMessagesData>(CONVERSATION_MESSAGES, {
      variables: { conversationId, before, first: 50 },
      fetchPolicy: "cache-and-network",
    });

  const loadMore = async () => {
    if (!data?.conversationMessages.nextCursor) return;
    await fetchMore({
      variables: {
        conversationId,
        before: data.conversationMessages.nextCursor,
        first: 50,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          conversationMessages: {
            ...fetchMoreResult.conversationMessages,
            data: [
              ...prev.conversationMessages.data,
              ...fetchMoreResult.conversationMessages.data,
            ],
          },
        };
      },
    });
  };

  return {
    messages: data?.conversationMessages.data ?? [],
    hasMore: data?.conversationMessages.hasMore ?? false,
    loading,
    error,
    loadMore,
    refetch,
  };
}

export function useSendMessage() {
  const [mutate, { loading, error }] =
    useMutation<SendMessageData>(SEND_MESSAGE);

  const sendMessage = async (
    input: SendMessageInput
  ): Promise<GqlMessage | null> => {
    const result = await mutate({
      variables: { input },
      update: (cache, { data }) => {
        if (!data?.sendMessage) return;

        const msg = data.sendMessage;

        // Update conversation messages cache
        const existing = cache.readQuery<ConversationMessagesData>({
          query: CONVERSATION_MESSAGES,
          variables: { conversationId: msg.conversationId, first: 50 },
        });

        if (existing) {
          cache.writeQuery<ConversationMessagesData>({
            query: CONVERSATION_MESSAGES,
            variables: { conversationId: msg.conversationId, first: 50 },
            data: {
              conversationMessages: {
                ...existing.conversationMessages,
                data: [msg, ...existing.conversationMessages.data],
              },
            },
          });
        }
      },
    });

    return result.data?.sendMessage ?? null;
  };

  return { sendMessage, loading, error };
}

export function useMarkMessagesRead() {
  const [mutate] = useMutation<MarkMessagesReadData>(MARK_MESSAGES_READ);

  const markRead = useCallback(
    async (conversationId: string) => {
      await mutate({ variables: { conversationId } });
    },
    [mutate]
  );

  return { markRead };
}

export function useUnreadCount() {
  const { data, loading, refetch } =
    useQuery<UnreadMessagesCountData>(UNREAD_MESSAGES_COUNT, {
      fetchPolicy: "cache-first",
    });

  return {
    unreadCount: data?.unreadMessagesCount ?? 0,
    loading,
    refetch,
  };
}

export function useStartConversation() {
  const [mutate, { loading, error }] =
    useMutation<StartConversationData>(START_CONVERSATION);

  const startConversation = async (orderId: string): Promise<string | null> => {
    const result = await mutate({ variables: { orderId } });
    return result.data?.startConversation.id ?? null;
  };

  return { startConversation, loading, error };
}
