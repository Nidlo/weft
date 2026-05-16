import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const useAuthGuardSpy = vi.fn();
const useBlueprintStoreSpy = vi.fn();

vi.mock("@/lib/hooks/use-auth-guard", () => ({
  useAuthGuard: (...args: unknown[]) => useAuthGuardSpy(...args),
}));

vi.mock("@/lib/stores/blueprint", () => ({
  useBlueprintStore: () => useBlueprintStoreSpy(),
}));

vi.mock("@apollo/client/react", () => ({
  useMutation: () => [vi.fn(), { loading: false }],
}));

// The wizard now also consumes the blueprint-draft hooks (save-as-draft
// + revise mode). Stub the hook module so the test doesn't need Apollo's
// useQuery; the create-order path under test is unaffected by them.
vi.mock("@/lib/hooks/use-blueprint-drafts", () => ({
  useCreateBlueprintDraft: () => ({
    createBlueprintDraft: vi.fn(),
    loading: false,
  }),
  useReviseBlueprintDraft: () => ({
    reviseBlueprintDraft: vi.fn(),
    loading: false,
  }),
  useBlueprintDraft: () => ({ draft: null, loading: false }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

vi.mock("@/components/layout/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

vi.mock("./step-garment", () => ({
  StepGarment: () => <div data-testid="step-garment" />,
}));
vi.mock("./step-design", () => ({
  StepDesign: () => <div data-testid="step-design" />,
}));
vi.mock("./step-reference-images", () => ({
  StepReferenceImages: () => <div data-testid="step-references" />,
}));
vi.mock("./step-fabric", () => ({
  StepFabric: () => <div data-testid="step-fabric" />,
}));
vi.mock("./step-measurements", () => ({
  StepMeasurements: () => <div data-testid="step-measurements" />,
}));
vi.mock("./step-budget", () => ({
  StepBudget: () => <div data-testid="step-budget" />,
}));
vi.mock("./step-review", () => ({
  StepReview: () => <div data-testid="step-review" />,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import BlueprintPage from "./page";

const USER = { id: "u-1", isOnboarded: true };

function makeStore(overrides: Record<string, unknown> = {}) {
  return {
    step: 0,
    setStep: vi.fn(),
    setField: vi.fn(),
    reset: vi.fn(),
    designerId: "designer-1",
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
    ...overrides,
  };
}

beforeEach(() => {
  useAuthGuardSpy.mockReset();
  useBlueprintStoreSpy.mockReset();
  useBlueprintStoreSpy.mockReturnValue(makeStore());
});

describe("BlueprintPage", () => {
  it("renders the loading skeleton while the auth guard isn't ready", () => {
    useAuthGuardSpy.mockReturnValue({ user: null, isReady: false });
    const { container } = render(<BlueprintPage />);
    expect(
      container.querySelectorAll("[data-slot=skeleton]").length
    ).toBeGreaterThan(0);
  });

  it("renders the editorial OnboardingShell with the blueprint title", () => {
    useAuthGuardSpy.mockReturnValue({ user: USER, isReady: true });
    render(<BlueprintPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /build your blueprint/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/^custom order$/i)).toBeInTheDocument();
  });

  it("renders the step indicator with all 7 step labels", () => {
    useAuthGuardSpy.mockReturnValue({ user: USER, isReady: true });
    render(<BlueprintPage />);
    [
      "Garment",
      "Design",
      "References",
      "Fabric",
      "Fit",
      "Budget",
      "Review",
    ].forEach((label) => {
      expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1);
    });
  });

  it("renders StepGarment when step is 0", () => {
    useAuthGuardSpy.mockReturnValue({ user: USER, isReady: true });
    useBlueprintStoreSpy.mockReturnValue(makeStore({ step: 0 }));
    render(<BlueprintPage />);
    expect(screen.getByTestId("step-garment")).toBeInTheDocument();
  });

  it("renders StepReview when step is 6", () => {
    useAuthGuardSpy.mockReturnValue({ user: USER, isReady: true });
    useBlueprintStoreSpy.mockReturnValue(makeStore({ step: 6 }));
    render(<BlueprintPage />);
    expect(screen.getByTestId("step-review")).toBeInTheDocument();
  });
});
