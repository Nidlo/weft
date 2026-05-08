import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { KineticText } from "./kinetic-text";

describe("KineticText", () => {
  it("renders the full phrase visible to assistive tech via aria-label", () => {
    render(<KineticText>Hello there friend</KineticText>);
    expect(screen.getByLabelText("Hello there friend")).toBeInTheDocument();
  });

  it("splits the phrase into per-word spans for staggered animation", () => {
    const { container } = render(<KineticText>One two three</KineticText>);
    const wrapper = container.firstChild as HTMLElement;
    // 3 words → 3 inner motion spans (plus the outer aria-label span)
    expect(wrapper.querySelectorAll("span").length).toBeGreaterThanOrEqual(3);
  });
});
