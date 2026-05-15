import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { StitchLoader } from "./stitch-loader";

describe("StitchLoader", () => {
  it("renders an accessible status region", () => {
    render(<StitchLoader />);
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute("aria-busy", "true");
  });

  it("shows the visible label when provided, otherwise an SR-only one", () => {
    const { rerender } = render(<StitchLoader />);
    expect(screen.getByText("Loading")).toBeInTheDocument();
    rerender(<StitchLoader label="Stitching your order…" />);
    expect(screen.getByText("Stitching your order…")).toBeInTheDocument();
  });

  it("renders the brand-mark SVG (needle + thread, not generic dots)", () => {
    render(<StitchLoader />);
    const svg = screen.getByTestId("stitch-loader-svg");
    expect(svg.tagName.toLowerCase()).toBe("svg");
    // Thread (dashed) + needle group should both render.
    expect(svg.querySelector("line[stroke-dasharray]")).not.toBeNull();
    // Needle traversal — SMIL animateTransform on a translation.
    expect(
      svg.querySelector('animateTransform[type="translate"]')
    ).not.toBeNull();
  });
});
