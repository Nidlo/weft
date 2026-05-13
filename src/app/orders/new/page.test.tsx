import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const useAuthGuardSpy = vi.fn();
const useBlueprintOptionsSpy = vi.fn();
const createInternalOrderSpy = vi.fn();
const searchClientsSpy = vi.fn();

vi.mock("@/lib/hooks/use-auth-guard", () => ({
  useAuthGuard: (...args: unknown[]) => useAuthGuardSpy(...args),
}));

vi.mock("@/lib/hooks/use-blueprint-options", () => ({
  useBlueprintOptions: (...args: unknown[]) => useBlueprintOptionsSpy(...args),
}));

vi.mock("@/lib/hooks/use-orders", () => ({
  useCreateInternalOrder: () => ({
    createInternalOrder: createInternalOrderSpy,
    loading: false,
  }),
  useSearchClients: () => ({
    searchClients: searchClientsSpy,
    results: [],
    loading: false,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

vi.mock("@/components/layout/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

vi.mock("@/components/orders/garment-type-combobox", () => ({
  GarmentTypeCombobox: () => <div data-testid="garment-type-combobox" />,
}));

vi.mock("@/components/orders/additional-details-combobox", () => ({
  AdditionalDetailsCombobox: () => (
    <div data-testid="additional-details-combobox" />
  ),
}));

vi.mock("@/components/orders/fabric-type-combobox", () => ({
  FabricTypeCombobox: () => <div data-testid="fabric-type-combobox" />,
}));

vi.mock("@/components/orders/reference-image-upload", () => ({
  ReferenceImageUpload: () => <div data-testid="ref-upload" />,
}));

vi.mock("@/components/orders/measurement-selector", () => ({
  MeasurementSelector: () => <div data-testid="measurement-selector" />,
}));

vi.mock("@/components/orders/budget-input", () => ({
  BudgetInput: () => <div data-testid="budget-input" />,
}));

vi.mock("@/components/orders/voice-input", () => ({
  VoiceInput: () => <div data-testid="voice-input" />,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

import NewOrderPage from "./page";

beforeEach(() => {
  useAuthGuardSpy.mockReset();
  useBlueprintOptionsSpy.mockReset();
  createInternalOrderSpy.mockReset();
  searchClientsSpy.mockReset();
  useBlueprintOptionsSpy.mockReturnValue({
    options: { garmentTypes: [], fabricTypes: [], designFields: {} },
    loading: false,
  });
});

describe("NewOrderPage", () => {
  it("renders the loading skeleton when the auth guard isn't ready", () => {
    useAuthGuardSpy.mockReturnValue({ user: null, isReady: false });
    const { container } = render(<NewOrderPage />);
    expect(
      container.querySelectorAll("[data-slot=skeleton]").length
    ).toBeGreaterThan(0);
  });

  it("renders the editorial header with the studio eyebrow", () => {
    useAuthGuardSpy.mockReturnValue({
      user: { id: "u-1", isDesigner: true, isOnboarded: true },
      isReady: true,
    });
    render(<NewOrderPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /new order/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/^studio$/i)).toBeInTheDocument();
  });

  it("renders the three section blocks (Brief, Pricing, Recipient)", () => {
    useAuthGuardSpy.mockReturnValue({
      user: { id: "u-1", isDesigner: true, isOnboarded: true },
      isReady: true,
    });
    render(<NewOrderPage />);
    expect(
      screen.getByRole("heading", { level: 2, name: /garment details/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /budget & timeline/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /^client$/i })
    ).toBeInTheDocument();
  });

  it("toggles the client mode pills when clicked", () => {
    useAuthGuardSpy.mockReturnValue({
      user: { id: "u-1", isDesigner: true, isOnboarded: true },
      isReady: true,
    });
    render(<NewOrderPage />);
    const externalPill = screen.getByRole("button", { name: /external/i });
    fireEvent.click(externalPill);
    expect(screen.getByText(/client name/i)).toBeInTheDocument();
    expect(screen.getByText(/client phone/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/kwame mensah/i)).toBeInTheDocument();
  });

  it("disables Create order until required fields are present", () => {
    useAuthGuardSpy.mockReturnValue({
      user: { id: "u-1", isDesigner: true, isOnboarded: true },
      isReady: true,
    });
    render(<NewOrderPage />);
    const submit = screen.getByRole("button", { name: /create order/i });
    expect(submit).toBeDisabled();
  });
});
