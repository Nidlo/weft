import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  phone: string;
  email: string | null;
  avatarUrl: string | null;
  city: string | null;
  isDesigner: boolean;
  isOnboarded: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      _hasHydrated: false,
      setUser: (user) =>
        set({ user, isAuthenticated: !!user, isLoading: false }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
      setHasHydrated: (_hasHydrated) => set({ _hasHydrated }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: "stitchhub-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export const useHasHydrated = () => useAuthStore((s) => s._hasHydrated);
