"use client";

import { create } from "zustand";

interface NotificationsState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  decrementUnread: (by?: number) => void;
  resetUnread: () => void;
}

export const useNotificationsStore = create<NotificationsState>()((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrementUnread: (by = 1) =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - by) })),
  resetUnread: () => set({ unreadCount: 0 }),
}));
