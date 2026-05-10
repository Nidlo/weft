import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MeasurementUnit } from "@/lib/utils/measurement";

interface PreferencesState {
  measurementUnit: MeasurementUnit;
  _hasHydrated: boolean;
  setMeasurementUnit: (unit: MeasurementUnit) => void;
  toggleMeasurementUnit: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      measurementUnit: "inches",
      _hasHydrated: false,
      setMeasurementUnit: (unit) => set({ measurementUnit: unit }),
      toggleMeasurementUnit: () =>
        set({
          measurementUnit: get().measurementUnit === "inches" ? "cm" : "inches",
        }),
    }),
    {
      name: "nidlo-preferences",
      partialize: (state) => ({ measurementUnit: state.measurementUnit }),
      // Zustand v5 + persist: setState inside onRehydrateStorage is overwritten
      // by the merge step. Use skipHydration + onFinishHydration so the
      // _hasHydrated flag survives. (W-NEXT-12)
      skipHydration: true,
    }
  )
);

if (typeof window !== "undefined") {
  usePreferencesStore.persist.onFinishHydration(() => {
    usePreferencesStore.setState({ _hasHydrated: true });
  });
  void usePreferencesStore.persist.rehydrate();
}
