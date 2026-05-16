import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { PoseIllustration } from "./pose-illustration";

describe("<PoseIllustration />", () => {
  it("renders the front pose with a descriptive a11y label", () => {
    render(<PoseIllustration variant="front" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute(
      "aria-label",
      expect.stringMatching(/front pose/i)
    );
    expect(img).toHaveAttribute(
      "aria-label",
      expect.stringMatching(/arms angled.+45 degrees/i)
    );
    expect(img).toHaveAttribute(
      "aria-label",
      expect.stringMatching(/palms facing down/i)
    );
  });

  it("renders the side pose with a descriptive a11y label", () => {
    render(<PoseIllustration variant="side" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute(
      "aria-label",
      expect.stringMatching(/side pose/i)
    );
    expect(img).toHaveAttribute(
      "aria-label",
      expect.stringMatching(/turn 90 degrees/i)
    );
    expect(img).toHaveAttribute(
      "aria-label",
      expect.stringMatching(/arms extended forward/i)
    );
  });

  it("shows a human-readable caption in hero mode (instructions step)", () => {
    render(<PoseIllustration variant="front" size="hero" />);
    expect(screen.getByText("Front pose")).toBeInTheDocument();
    expect(
      screen.getByText(/arms angled away from sides · palms down/i)
    ).toBeInTheDocument();
  });

  it("shows a compact horizontal caption in thumb mode (upload step)", () => {
    render(<PoseIllustration variant="side" size="thumb" />);
    expect(screen.getByText("Side pose")).toBeInTheDocument();
    expect(
      screen.getByText(/profile turn · arms forward · palms in/i)
    ).toBeInTheDocument();
  });

  it("renders an SVG figure inside both layouts", () => {
    const { container, rerender } = render(
      <PoseIllustration variant="front" size="hero" />
    );
    expect(container.querySelector("svg")).toBeInTheDocument();

    rerender(<PoseIllustration variant="side" size="thumb" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("accepts a custom aria-label override", () => {
    render(
      <PoseIllustration variant="front" ariaLabel="Pose to use for your scan" />
    );
    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      "Pose to use for your scan"
    );
  });
});
