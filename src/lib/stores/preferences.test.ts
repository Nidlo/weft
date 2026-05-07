import { describe, it, expect, beforeEach } from "vitest";
import { usePreferencesStore } from "./preferences";

describe("usePreferencesStore", () => {
  beforeEach(() => {
    usePreferencesStore.setState({
      measurementUnit: "inches",
      _hasHydrated: false,
    });
  });

  it("defaults to inches", () => {
    expect(usePreferencesStore.getState().measurementUnit).toBe("inches");
  });

  it("sets the measurement unit", () => {
    usePreferencesStore.getState().setMeasurementUnit("cm");
    expect(usePreferencesStore.getState().measurementUnit).toBe("cm");
  });

  it("toggles between inches and cm", () => {
    expect(usePreferencesStore.getState().measurementUnit).toBe("inches");
    usePreferencesStore.getState().toggleMeasurementUnit();
    expect(usePreferencesStore.getState().measurementUnit).toBe("cm");
    usePreferencesStore.getState().toggleMeasurementUnit();
    expect(usePreferencesStore.getState().measurementUnit).toBe("inches");
  });
});
