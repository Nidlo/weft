import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { NeedleIcon } from "./needle-icon";

describe("NeedleIcon", () => {
  it("renders an SVG with the needle body and tip", () => {
    const { container } = render(<NeedleIcon />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.querySelectorAll("path").length).toBeGreaterThanOrEqual(2);
  });

  it("includes the trailing thread arc only when withThread is true", () => {
    const { container: noThread } = render(<NeedleIcon />);
    const noThreadPaths = noThread.querySelectorAll("path");
    const { container: withThread } = render(<NeedleIcon withThread />);
    const withThreadPaths = withThread.querySelectorAll("path");
    expect(withThreadPaths.length).toBeGreaterThan(noThreadPaths.length);
  });

  it("forwards extra SVG attributes", () => {
    const { container } = render(
      <NeedleIcon className="custom-class" data-testid="needle" />
    );
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("data-testid")).toBe("needle");
    expect(svg?.className.baseVal).toContain("custom-class");
  });
});
