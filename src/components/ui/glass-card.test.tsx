import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { GlassCard } from "./glass-card";

describe("GlassCard", () => {
  it("renders children inside the card surface", () => {
    render(<GlassCard>hello</GlassCard>);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("applies the variant data attribute", () => {
    render(
      <GlassCard variant="strong" data-testid="card">
        x
      </GlassCard>
    );
    expect(screen.getByTestId("card")).toHaveAttribute(
      "data-variant",
      "strong"
    );
  });

  it("merges consumer classes with the variant classes", () => {
    render(
      <GlassCard className="my-custom" data-testid="card">
        x
      </GlassCard>
    );
    expect(screen.getByTestId("card").className).toContain("my-custom");
  });

  it("activates the interactive hover affordances when interactive is true", () => {
    render(
      <GlassCard interactive data-testid="card">
        x
      </GlassCard>
    );
    expect(screen.getByTestId("card").className).toContain("cursor-pointer");
  });
});
