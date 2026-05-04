import { describe, it, expect, beforeEach } from "vitest";
import { useOnboardingStore } from "./onboarding";
import { useClientOnboardingStore } from "./client-onboarding";

// Resume-mid-wizard regression test (FE-NIDLO-ONBD-10).
// Both onboarding stores use the Zustand `persist` middleware against
// localStorage. A user who refreshes mid-wizard should see their fields
// + step intact. We verify that contract: write fields, then re-read the
// raw localStorage payload (which is what a fresh page-load would consume).

describe("useOnboardingStore persistence (designer wizard)", () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset();
    localStorage.clear();
  });

  it("persists step + fields to localStorage", () => {
    const { setStep, setField } = useOnboardingStore.getState();
    setStep(2);
    setField("firstName", "Kwame");
    setField("displayName", "Kwame Tailoring");
    setField("specializations", ["kaba_slit", "agbada"]);
    setField("pricingMin", "150");
    setField("termsAccepted", true);

    const raw = localStorage.getItem("stitchhub-onboarding");
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw!);
    expect(parsed.state.step).toBe(2);
    expect(parsed.state.firstName).toBe("Kwame");
    expect(parsed.state.displayName).toBe("Kwame Tailoring");
    expect(parsed.state.specializations).toEqual(["kaba_slit", "agbada"]);
    expect(parsed.state.pricingMin).toBe("150");
    expect(parsed.state.termsAccepted).toBe(true);
  });

  it("`reset()` clears persisted fields back to initial", () => {
    const { setField, reset } = useOnboardingStore.getState();
    setField("firstName", "Kwame");
    setField("specializations", ["kaba_slit"]);

    reset();

    const state = useOnboardingStore.getState();
    expect(state.step).toBe(0);
    expect(state.firstName).toBe("");
    expect(state.specializations).toEqual([]);
    expect(state.termsAccepted).toBe(false);
  });
});

describe("useClientOnboardingStore persistence (client wizard)", () => {
  beforeEach(() => {
    useClientOnboardingStore.getState().reset();
    localStorage.clear();
  });

  it("persists step + fields to localStorage", () => {
    const { setStep, setField } = useClientOnboardingStore.getState();
    setStep(1);
    setField("firstName", "Ama");
    setField("fashionInterests", ["wedding_dress", "kaba_slit"]);
    setField("referralSource", "instagram");
    setField("termsAccepted", true);

    const raw = localStorage.getItem("stitchhub-client-onboarding");
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw!);
    expect(parsed.state.step).toBe(1);
    expect(parsed.state.firstName).toBe("Ama");
    expect(parsed.state.fashionInterests).toEqual([
      "wedding_dress",
      "kaba_slit",
    ]);
    expect(parsed.state.referralSource).toBe("instagram");
    expect(parsed.state.termsAccepted).toBe(true);
  });

  it("`reset()` clears persisted fields back to initial", () => {
    const { setField, reset } = useClientOnboardingStore.getState();
    setField("firstName", "Ama");
    setField("fashionInterests", ["wedding_dress"]);

    reset();

    const state = useClientOnboardingStore.getState();
    expect(state.step).toBe(0);
    expect(state.firstName).toBe("");
    expect(state.fashionInterests).toEqual([]);
    expect(state.termsAccepted).toBe(false);
  });
});
