import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OnboardingState {
  step: number;
  firstName: string;
  lastName: string;
  otherNames: string;
  displayName: string;
  bio: string;
  city: string;
  locationLat: number | null;
  locationLng: number | null;
  specializations: string[];
  pricingMin: string;
  pricingMax: string;
  equipment: string[];
  setStep: (step: number) => void;
  setField: <K extends keyof OnboardingFields>(
    key: K,
    value: OnboardingFields[K]
  ) => void;
  reset: () => void;
}

type OnboardingFields = Pick<
  OnboardingState,
  | "firstName"
  | "lastName"
  | "otherNames"
  | "displayName"
  | "bio"
  | "city"
  | "locationLat"
  | "locationLng"
  | "specializations"
  | "pricingMin"
  | "pricingMax"
  | "equipment"
>;

const initialFields: OnboardingFields = {
  firstName: "",
  lastName: "",
  otherNames: "",
  displayName: "",
  bio: "",
  city: "",
  locationLat: null,
  locationLng: null,
  specializations: [],
  pricingMin: "",
  pricingMax: "",
  equipment: [],
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      step: 0,
      ...initialFields,
      setStep: (step) => set({ step }),
      setField: (key, value) => set({ [key]: value }),
      reset: () => set({ step: 0, ...initialFields }),
    }),
    {
      name: "stitchhub-onboarding",
    }
  )
);
