import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { OnboardingShell } from "./onboarding-shell";

const STEPS = ["Basics", "Style", "Location", "Finish"] as const;

function renderShell(overrides: Partial<React.ComponentProps<typeof OnboardingShell>> = {}) {
  const props: React.ComponentProps<typeof OnboardingShell> = {
    eyebrow: "Test wizard",
    title: "Set up your profile.",
    steps: STEPS,
    step: 0,
    onBack: vi.fn(),
    onNext: vi.fn(),
    onComplete: vi.fn(),
    canProceed: true,
    children: <p>step content</p>,
    ...overrides,
  };
  return { props, ...render(<OnboardingShell {...props} />) };
}

describe("OnboardingShell", () => {
  it("renders the editorial header + step caption", () => {
    renderShell({ step: 1 });
    expect(screen.getByText("Test wizard")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: /set up your profile/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/step 2 of 4/i)).toBeInTheDocument();
  });

  it("disables Back on the first step and Continue when canProceed is false", () => {
    renderShell({ step: 0, canProceed: false });
    expect(screen.getByRole("button", { name: /back/i })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /continue/i })
    ).toBeDisabled();
  });

  it("calls onNext when Continue is clicked and canProceed is true", () => {
    const { props } = renderShell({ step: 1, canProceed: true });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(props.onNext).toHaveBeenCalledTimes(1);
  });

  it("renders Skip when onSkip is provided and the step isn't the last", () => {
    renderShell({ step: 1, onSkip: vi.fn() });
    expect(
      screen.getByRole("button", { name: /skip/i })
    ).toBeInTheDocument();
  });

  it("swaps Continue for the complete button on the last step", () => {
    renderShell({ step: STEPS.length - 1, completeLabel: "Get started" });
    expect(
      screen.queryByRole("button", { name: /continue/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /get started/i })
    ).toBeInTheDocument();
  });

  it("marks the active step via aria-current and renders all step labels", () => {
    renderShell({ step: 2 });
    STEPS.forEach((label) => {
      // The active step name appears in both the caption and the indicator,
      // so use getAllByText to allow either-or-both occurrences.
      expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1);
    });
    const activeChip = screen
      .getAllByText("Location")
      .map((el) => el.closest("li"))
      .find((li): li is HTMLLIElement => li !== null);
    expect(activeChip).toHaveAttribute("aria-current", "step");
  });
});
