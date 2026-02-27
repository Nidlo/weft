"use client";

import { create } from "zustand";

interface MessagesState {
  unreadCount: number;
  activeConversationId: string | null;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: (by?: number) => void;
  setActiveConversation: (id: string | null) => void;
}

export const useMessagesStore = create<MessagesState>()((set) => ({
  unreadCount: 0,
  activeConversationId: null,
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnreadCount: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrementUnreadCount: (by = 1) =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - by) })),
  setActiveConversation: (id) => set({ activeConversationId: id }),
}));
