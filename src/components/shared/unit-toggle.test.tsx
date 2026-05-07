import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { UnitToggle } from "./unit-toggle";
import { usePreferencesStore } from "@/lib/stores/preferences";

beforeEach(() => {
  usePreferencesStore.setState({
    measurementUnit: "inches",
    _hasHydrated: true,
  });
});

describe("UnitToggle", () => {
  it("renders with an accessible label reflecting the current unit", () => {
    render(<UnitToggle />);
    const sw = screen.getByRole("switch", {
      name: /switch measurement unit, currently inches/i,
    });
    expect(sw).toBeInTheDocument();
  });

  it("toggles the persisted store on click", () => {
    render(<UnitToggle />);
    const sw = screen.getByRole("switch");
    fireEvent.click(sw);
    expect(usePreferencesStore.getState().measurementUnit).toBe("cm");
    fireEvent.click(sw);
    expect(usePreferencesStore.getState().measurementUnit).toBe("inches");
  });
});
