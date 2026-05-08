import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Section } from "./section";

describe("Section", () => {
  it("renders the eyebrow, title, description, and children", () => {
    render(
      <Section
        eyebrow="Featured"
        title="Top picks"
        description="The best of the best"
      >
        <p>body</p>
      </Section>
    );
    expect(screen.getByText("Featured")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Top picks", level: 2 })
    ).toBeInTheDocument();
    expect(screen.getByText("The best of the best")).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("renders the action slot when provided", () => {
    render(
      <Section title="x" action={<a href="/all">See all</a>}>
        body
      </Section>
    );
    expect(screen.getByRole("link", { name: "See all" })).toBeInTheDocument();
  });

  it("collapses the header when no header props are passed", () => {
    const { container } = render(<Section>only body</Section>);
    expect(container.querySelector("header")).toBeNull();
  });
});
