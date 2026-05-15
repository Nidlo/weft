import { create } from "zustand";
import { persist } from "zustand/middleware";
import { resetCsrfState } from "@/lib/graphql/csrf";

export interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  otherNames?: string | null;
  fullName: string | null;
  heightCm?: number | null;
  phone: string;
  email: string | null;
  avatarUrl: string | null;
  city: string | null;
  region?: string | null;
  countryCode?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  addressLine?: string | null;
  postalCode?: string | null;
  formattedAddress?: string | null;
  isVerified?: boolean;
  isDesigner: boolean;
  isOnboarded: boolean;
  hasVerifiedWalletAccount?: boolean;
  // QA-AD-USER-012 - true when the current session was started by a
  // super-admin via the admin panel's Impersonate action. Powers the
  // sticky banner + Stop-impersonating button.
  isImpersonated?: boolean;
  impersonatorEmail?: string | null;
  termsAcceptedVersion?: string | null;
  designerProfile?: {
    slug: string | null;
    profileViewsCount: number;
    profileViewsThisWeek: number;
  } | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
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
      _hasHydrated: false,
      setUser: (user) =>
        set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        resetCsrfState();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: "stitchhub-auth",
      partialize: (state) => ({ user: state.user }),
      // skipHydration: rehydrate manually after registering onFinishHydration
      // so that setState inside the callback is not overwritten by the
      // persist middleware's own merge (Zustand v5 breaking change).
      skipHydration: true,
    }
  )
);

// Register hydration callback BEFORE triggering rehydration.
// In Zustand v5, setState inside onRehydrateStorage is overwritten by the
// persist middleware's state merge. onFinishHydration fires AFTER the merge,
// so setState calls here persist correctly.
if (typeof window !== "undefined") {
  useAuthStore.persist.onFinishHydration((state) => {
    const hasAuth = !!state.user;
    useAuthStore.setState({ _hasHydrated: true, isAuthenticated: hasAuth });
  });
  useAuthStore.persist.rehydrate();
}

export const useHasHydrated = () => useAuthStore((s) => s._hasHydrated);
