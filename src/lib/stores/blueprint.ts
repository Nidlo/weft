import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BlueprintState {
  step: number;
  designerId: string;
  // Step 1: Garment & Occasion
  garmentType: string;
  garmentTypeOther: string;
  occasion: string;
  // Step 2: Design Details
  designDetails: Record<string, string | string[]>;
  additionalDetails: string[];
  freeText: string;
  // Step 3: Reference Images
  referenceImages: ReferenceImage[];
  // Step 4: Fabric
  fabricType: string;
  fabricTypeOther: string;
  fabricColour: string;
  fabricColourHex: string;
  clientProvidingFabric: boolean;
  fabricNotes: string;
  // Step 5: Measurements
  measurementSource: "saved_profile" | "manual" | "ai_photo" | "";
  measurementId: string;
  // Step 6: Budget & Timeline
  budgetMin: string;
  budgetMax: string;
  deadline: string;
  notes: string;
  // Actions
  setStep: (step: number) => void;
  setField: <K extends keyof BlueprintFields>(
    key: K,
    value: BlueprintFields[K]
  ) => void;
  reset: () => void;
}

export interface ReferenceImage {
  url: string;
  publicId: string;
  name: string;
}

export type BlueprintFields = Pick<
  BlueprintState,
  | "designerId"
  | "garmentType"
  | "garmentTypeOther"
  | "occasion"
  | "designDetails"
  | "additionalDetails"
  | "freeText"
  | "referenceImages"
  | "fabricType"
  | "fabricTypeOther"
  | "fabricColour"
  | "fabricColourHex"
  | "clientProvidingFabric"
  | "fabricNotes"
  | "measurementSource"
  | "measurementId"
  | "budgetMin"
  | "budgetMax"
  | "deadline"
  | "notes"
>;

const initialFields: BlueprintFields = {
  designerId: "",
  garmentType: "",
  garmentTypeOther: "",
  occasion: "",
  designDetails: {},
  additionalDetails: [],
  freeText: "",
  referenceImages: [],
  fabricType: "",
  fabricTypeOther: "",
  fabricColour: "",
  fabricColourHex: "",
  clientProvidingFabric: false,
  fabricNotes: "",
  measurementSource: "",
  measurementId: "",
  budgetMin: "",
  budgetMax: "",
  deadline: "",
  notes: "",
};

export const useBlueprintStore = create<BlueprintState>()(
  persist(
    (set) => ({
      step: 0,
      ...initialFields,
      setStep: (step) => set({ step }),
      setField: (key, value) => set({ [key]: value }),
      reset: () => set({ step: 0, ...initialFields }),
    }),
    {
      name: "stitchhub-blueprint",
    }
  )
);
