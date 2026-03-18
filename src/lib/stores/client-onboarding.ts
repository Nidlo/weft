import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LocationData } from "@/types/location";

export interface ClientOnboardingState {
  step: number;
  firstName: string;
  lastName: string;
  email: string;
  fashionInterests: string[];
  genderPreference: string;
  location: Partial<LocationData> | null;
  referralSource: string;
  termsAccepted: boolean;
  setStep: (step: number) => void;
  setField: <K extends keyof ClientOnboardingFields>(
    key: K,
    value: ClientOnboardingFields[K]
  ) => void;
  reset: () => void;
}

type ClientOnboardingFields = Pick<
  ClientOnboardingState,
  | "firstName"
  | "lastName"
  | "email"
  | "fashionInterests"
  | "genderPreference"
  | "location"
  | "referralSource"
  | "termsAccepted"
>;

const initialFields: ClientOnboardingFields = {
  firstName: "",
  lastName: "",
  email: "",
  fashionInterests: [],
  genderPreference: "",
  location: null,
  referralSource: "",
  termsAccepted: false,
};

export const useClientOnboardingStore = create<ClientOnboardingState>()(
  persist(
    (set) => ({
      step: 0,
      ...initialFields,
      setStep: (step) => set({ step }),
      setField: (key, value) => set({ [key]: value }),
      reset: () => set({ step: 0, ...initialFields }),
    }),
    {
      name: "stitchhub-client-onboarding",
    }
  )
);
