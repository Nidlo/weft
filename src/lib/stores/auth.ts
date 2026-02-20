import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "client" | "designer" | "organization";

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: UserRole | null;
  avatarUrl: string | null;
  city: string | null;
  isOnboarded: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) =>
        set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () =>
        set({ user: null, isAuthenticated: false, isLoading: false }),
    }),
    {
      name: "stitchhub-auth",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
