import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const useQuerySpy = vi.fn();
const generateMutationSpy = vi.fn();
const measurementsRef = { current: [] as Array<{ id: string; isDefault: boolean }> };
const toastSuccessSpy = vi.fn();
const toastErrorSpy = vi.fn();

vi.mock("@apollo/client/react", () => ({
  useQuery: (...args: unknown[]) => useQuerySpy(...args),
  useMutation: () => [generateMutationSpy, { loading: false }],
}));

vi.mock("@/lib/hooks/use-measurements", () => ({
  useMeasurements: () => ({
    measurements: measurementsRef.current,
    loading: false,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (msg: string) => toastSuccessSpy(msg),
    error: (msg: string) => toastErrorSpy(msg),
  },
}));

import { StyleProfileCard } from "./style-profile-card";

const PROFILE_FIXTURE = {
  bodyShape: "hourglass" as const,
  bodyShapeConfidence: 0.82,
  flatteringSilhouettes: ["wrap dress", "fitted bodice"],
  colorPalette: ["#1a1612", "#d68a4f"],
  fabricRecommendations: ["silk", "ankara"],
  recommendedSpecializations: ["kaba_and_slit"],
  summary: "Your hourglass shape suits structured silhouettes.",
  fromFallback: false,
  generatedAt: "2026-05-07T14:00:00Z",
};

beforeEach(() => {
  useQuerySpy.mockReset();
  generateMutationSpy.mockReset();
  toastSuccessSpy.mockReset();
  toastErrorSpy.mockReset();
  measurementsRef.current = [];
});

describe("StyleProfileCard", () => {
  it("renders the empty-state CTA when no profile exists", () => {
    measurementsRef.current = [{ id: "m-1", isDefault: true }];
    useQuerySpy.mockReturnValue({
      data: { myStyleProfile: null },
      loading: false,
    });

    render(<StyleProfileCard />);

    expect(
      screen.getByRole("heading", { level: 3, name: /discover your style profile/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /generate my style profile/i })
    ).toBeEnabled();
  });

  it("disables the generate button when no measurement is saved", () => {
    measurementsRef.current = [];
    useQuerySpy.mockReturnValue({
      data: { myStyleProfile: null },
      loading: false,
    });

    render(<StyleProfileCard />);

    expect(
      screen.getByRole("button", { name: /save a measurement first/i })
    ).toBeDisabled();
  });

  it("renders the profile result when one is cached", () => {
    measurementsRef.current = [{ id: "m-1", isDefault: true }];
    useQuerySpy.mockReturnValue({
      data: { myStyleProfile: PROFILE_FIXTURE },
      loading: false,
    });

    render(<StyleProfileCard />);

    expect(
      screen.getByRole("heading", { level: 3, name: /hourglass/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/your hourglass shape suits structured silhouettes/i)
    ).toBeInTheDocument();
    expect(screen.getByText("wrap dress")).toBeInTheDocument();
    expect(screen.getByText("silk")).toBeInTheDocument();
    expect(screen.getByText(/kaba and slit/i)).toBeInTheDocument();
  });

  it("triggers the generate mutation on click", async () => {
    measurementsRef.current = [{ id: "m-1", isDefault: true }];
    useQuerySpy.mockReturnValue({
      data: { myStyleProfile: null },
      loading: false,
    });
    generateMutationSpy.mockResolvedValue({
      data: { generateStyleProfile: PROFILE_FIXTURE },
    });

    const user = userEvent.setup();
    render(<StyleProfileCard />);

    await user.click(
      screen.getByRole("button", { name: /generate my style profile/i })
    );

    expect(generateMutationSpy).toHaveBeenCalledWith({
      variables: { measurementId: "m-1" },
    });
    expect(toastSuccessSpy).toHaveBeenCalledWith("Style profile generated.");
  });

  it("shows the fallback notice when the profile came from the no-Claude path", () => {
    measurementsRef.current = [{ id: "m-1", isDefault: true }];
    useQuerySpy.mockReturnValue({
      data: { myStyleProfile: { ...PROFILE_FIXTURE, fromFallback: true } },
      loading: false,
    });

    render(<StyleProfileCard />);

    expect(
      screen.getByText(/showing a default profile while AI analysis is unavailable/i)
    ).toBeInTheDocument();
  });
});
