import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { MeasurementSummary } from "./measurement-summary";
import { usePreferencesStore } from "@/lib/stores/preferences";
import type { MeasurementMmData } from "@/types/graphql";

beforeEach(() => {
  usePreferencesStore.setState({
    measurementUnit: "inches",
    _hasHydrated: true,
  });
});

describe("MeasurementSummary", () => {
  it("renders mm-canonical values converted to the user's preferred unit", () => {
    const dataMm: MeasurementMmData = {
      upper_body: { bust: 914, waist: 720 },
    };

    render(
      <MeasurementSummary
        dataMm={dataMm}
        manualOverridesMm={{}}
        aiBaselineMm={null}
      />,
    );

    // 914mm → 36.0 in
    expect(screen.getByText(/36\.0 in/)).toBeInTheDocument();
  });

  it("renders a non-clickable override badge when onResetField is not provided", () => {
    render(
      <MeasurementSummary
        dataMm={{ upper_body: { bust: 940 } }}
        manualOverridesMm={{ upper_body: { bust: 940 } }}
        aiBaselineMm={{ upper_body: { bust: 914 } }}
      />,
    );

    // Badge present, but it's a span not a button
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders a clickable reset button when onResetField is provided and a field is overridden", () => {
    const onReset = vi.fn();
    render(
      <MeasurementSummary
        dataMm={{ upper_body: { bust: 940 } }}
        manualOverridesMm={{ upper_body: { bust: 940 } }}
        aiBaselineMm={{ upper_body: { bust: 914 } }}
        onResetField={onReset}
      />,
    );

    const button = screen.getByRole("button", {
      name: /reset bust.*ai baseline/i,
    });
    fireEvent.click(button);
    expect(onReset).toHaveBeenCalledWith("upper_body", "bust");
  });

  it("does not render a reset button on un-overridden fields", () => {
    const onReset = vi.fn();
    render(
      <MeasurementSummary
        dataMm={{ upper_body: { bust: 914 } }}
        manualOverridesMm={{}}
        aiBaselineMm={{ upper_body: { bust: 914 } }}
        onResetField={onReset}
      />,
    );

    expect(screen.queryByRole("button")).toBeNull();
  });
});
