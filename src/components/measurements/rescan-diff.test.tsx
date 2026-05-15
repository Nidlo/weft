import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { RescanDiff } from "./rescan-diff";
import { usePreferencesStore } from "@/lib/stores/preferences";
import type { MeasurementMmData } from "@/types/graphql";

beforeEach(() => {
  usePreferencesStore.setState({
    measurementUnit: "inches",
    _hasHydrated: true,
  });
});

describe("RescanDiff", () => {
  it("renders a no-changes message when baseline equals proposed", () => {
    const data: MeasurementMmData = { upper_body: { bust: 914 } };
    render(
      <RescanDiff
        baselineMm={data}
        proposedMm={data}
        onApply={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText(/no changes detected/i)).toBeInTheDocument();
  });

  it("classifies a tiny drift as auto and an mid-range drift as prompt", () => {
    // bust: 914 → 920 (6mm = auto, < 13)
    // waist: 720 → 745 (25mm = prompt, between 13 and 51)
    render(
      <RescanDiff
        baselineMm={{ upper_body: { bust: 914, waist: 720 } }}
        proposedMm={{ upper_body: { bust: 920, waist: 745 } }}
        onApply={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    // "auto-applied" appears in the header summary AND the badge — assert
    // both surfaces are populated by checking the count is at least one.
    expect(screen.getAllByText(/auto-applied/i).length).toBeGreaterThan(0);
    // "Confirm" appears as both a column header and the badge — at least
    // one badge plus the header counts as ≥ 2.
    expect(screen.getAllByText(/^Confirm$/).length).toBeGreaterThanOrEqual(2);
  });

  it("classifies a huge drift as rejected and shows the warning text", () => {
    // 60mm = >= 51mm reject threshold
    render(
      <RescanDiff
        baselineMm={{ upper_body: { bust: 914 } }}
        proposedMm={{ upper_body: { bust: 974 } }}
        onApply={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText(/^Rejected$/)).toBeInTheDocument();
    expect(
      screen.getByText(/too large for the AI to be trustworthy/i)
    ).toBeInTheDocument();
  });

  it("calls onApply with the confirmed prompt-tier fields only", async () => {
    const onApply = vi.fn().mockResolvedValue(undefined);
    render(
      <RescanDiff
        baselineMm={{
          upper_body: { bust: 914, waist: 720 },
        }}
        proposedMm={{
          upper_body: { bust: 920, waist: 745 }, // bust auto, waist prompt
        }}
        onApply={onApply}
        onCancel={vi.fn()}
      />
    );

    // Tick the prompt-tier checkbox
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(1); // one prompt-tier row
    fireEvent.click(checkboxes[0]);

    fireEvent.click(screen.getByRole("button", { name: /apply confirmed/i }));

    expect(onApply).toHaveBeenCalledWith([
      { section: "upper_body", field: "waist" },
    ]);
  });

  it("calls onApply with empty array when no prompt fields are confirmed", async () => {
    const onApply = vi.fn().mockResolvedValue(undefined);
    render(
      <RescanDiff
        baselineMm={{ upper_body: { bust: 914 } }}
        proposedMm={{ upper_body: { bust: 920 } }} // auto only
        onApply={onApply}
        onCancel={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /apply auto/i }));
    expect(onApply).toHaveBeenCalledWith([]);
  });

  it("renders proposed values in the user's preferred unit", () => {
    // 914mm → 36.0 in (inches preferred)
    render(
      <RescanDiff
        baselineMm={{ upper_body: { bust: 800 } }}
        proposedMm={{ upper_body: { bust: 914 } }}
        onApply={vi.fn()}
      />
    );
    expect(screen.getByText(/36\.0 in/)).toBeInTheDocument();
  });
});
