import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { ThreadDivider } from "./thread-divider";

describe("ThreadDivider", () => {
  it("renders an SVG with two stitched lines", () => {
    const { container } = render(<ThreadDivider width={300} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelectorAll("line").length).toBe(2);
  });

  it("renders the label text when supplied", () => {
    const { container } = render(
      <ThreadDivider width={300} label="Spotlight" />
    );
    expect(container.querySelector("text")?.textContent).toBe("Spotlight");
  });

  it("uses currentColor for the ink tone variant", () => {
    const { container } = render(
      <ThreadDivider width={300} tone="ink" />
    );
    const lines = container.querySelectorAll("line");
    lines.forEach((line) => {
      expect(line.getAttribute("stroke")).toBe("currentColor");
    });
  });
});
