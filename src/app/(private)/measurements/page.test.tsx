import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const useAuthGuardSpy = vi.fn();
const useMeasurementsSpy = vi.fn();

vi.mock("@/lib/hooks/use-auth-guard", () => ({
  useAuthGuard: (...args: unknown[]) => useAuthGuardSpy(...args),
}));

vi.mock("@/lib/hooks/use-measurements", () => ({
  useMeasurements: () => useMeasurementsSpy(),
  useCreateMeasurement: () => ({ createMeasurement: vi.fn(), loading: false }),
  useUpdateMeasurement: () => ({ updateMeasurement: vi.fn(), loading: false }),
  useDeleteMeasurement: () => ({ deleteMeasurement: vi.fn() }),
  useSetDefaultMeasurement: () => ({ setDefaultMeasurement: vi.fn() }),
  useResetMeasurementField: () => ({
    resetMeasurementField: vi.fn(),
    loading: false,
  }),
}));

vi.mock("@/components/layout/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

vi.mock("@/components/shared/measurement-summary", () => ({
  MeasurementSummary: () => <div data-testid="measurement-summary" />,
  FIELD_LABELS: {},
  SECTION_LABELS: {},
}));

vi.mock("@/components/shared/unit-toggle", () => ({
  UnitToggle: () => <div data-testid="unit-toggle" />,
}));

vi.mock("./manual-form", () => ({
  ManualForm: () => <div data-testid="manual-form" />,
}));

vi.mock("./ai-flow", () => ({
  AiFlow: () => <div data-testid="ai-flow" />,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

import MeasurementsPage from "./page";

const USER = { id: "u-1", isOnboarded: true };

beforeEach(() => {
  useAuthGuardSpy.mockReset();
  useMeasurementsSpy.mockReset();
});

describe("MeasurementsPage", () => {
  it("renders the loading skeleton until the auth guard resolves", () => {
    useAuthGuardSpy.mockReturnValue({ user: null, isReady: false });
    useMeasurementsSpy.mockReturnValue({
      measurements: [],
      loading: true,
      refetch: vi.fn(),
    });
    const { container } = render(<MeasurementsPage />);
    expect(
      container.querySelectorAll("[data-slot=skeleton]").length
    ).toBeGreaterThan(0);
  });

  it("renders the editorial header with the profile-count tracker", () => {
    useAuthGuardSpy.mockReturnValue({ user: USER, isReady: true });
    useMeasurementsSpy.mockReturnValue({
      measurements: [],
      loading: false,
      refetch: vi.fn(),
    });
    render(<MeasurementsPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /body vault/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/\/ 10 profiles/i)).toBeInTheDocument();
  });

  it("renders the empty state with both add affordances when no profiles exist", () => {
    useAuthGuardSpy.mockReturnValue({ user: USER, isReady: true });
    useMeasurementsSpy.mockReturnValue({
      measurements: [],
      loading: false,
      refetch: vi.fn(),
    });
    render(<MeasurementsPage />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /no measurement profiles/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /fitscan ai/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", { name: /add manual/i }).length
    ).toBeGreaterThan(0);
  });

  it("renders measurement profiles with badges + actions when present", () => {
    useAuthGuardSpy.mockReturnValue({ user: USER, isReady: true });
    useMeasurementsSpy.mockReturnValue({
      measurements: [
        {
          id: "m-1",
          label: "My body",
          unit: "cm",
          source: "manual",
          isDefault: true,
          createdAt: "2026-04-01T00:00:00Z",
          data: { upper_body: {}, lower_body: {}, vertical: {} },
        },
        {
          id: "m-2",
          label: "Wedding fit",
          unit: "cm",
          source: "ai_photo",
          isDefault: false,
          createdAt: "2026-05-01T00:00:00Z",
          data: { upper_body: {}, lower_body: {}, vertical: {} },
        },
      ],
      loading: false,
      refetch: vi.fn(),
    });
    render(<MeasurementsPage />);
    expect(screen.getByText(/my body/i)).toBeInTheDocument();
    expect(screen.getByText(/wedding fit/i)).toBeInTheDocument();
    expect(screen.getByText(/^default$/i)).toBeInTheDocument();
    expect(screen.getAllByText(/fitscan ai/i).length).toBeGreaterThan(0);
  });

  it("hides the add buttons when the user has 10 profiles", () => {
    const profiles = Array.from({ length: 10 }, (_, i) => ({
      id: `m-${i}`,
      label: `Profile ${i}`,
      unit: "cm",
      source: "manual",
      isDefault: i === 0,
      createdAt: "2026-04-01T00:00:00Z",
      data: { upper_body: {}, lower_body: {}, vertical: {} },
    }));
    useAuthGuardSpy.mockReturnValue({ user: USER, isReady: true });
    useMeasurementsSpy.mockReturnValue({
      measurements: profiles,
      loading: false,
      refetch: vi.fn(),
    });
    render(<MeasurementsPage />);
    expect(
      screen.queryByRole("button", { name: /add manual/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^fitscan ai$/i })
    ).not.toBeInTheDocument();
  });
});
