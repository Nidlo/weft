import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LocationData } from "@/types/location";

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
  location: Partial<LocationData> | null;
  specializations: string[];
  pricingMin: string;
  pricingMax: string;
  equipment: string[];
  yearsOfExperience: string;
  termsAccepted: boolean;
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
  | "location"
  | "specializations"
  | "pricingMin"
  | "pricingMax"
  | "equipment"
  | "yearsOfExperience"
  | "termsAccepted"
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
  location: null,
  specializations: [],
  pricingMin: "",
  pricingMax: "",
  equipment: [],
  yearsOfExperience: "",
  termsAccepted: false,
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
