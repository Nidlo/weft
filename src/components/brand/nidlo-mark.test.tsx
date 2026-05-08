import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { NidloMark } from "./nidlo-mark";

describe("NidloMark", () => {
  it("renders the wordmark with an accessible label", () => {
    const { container } = render(<NidloMark variant="wordmark" />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("aria-label")).toBe("Nidlo");
  });

  it("includes the tagline in the aria-label for the tagline variant", () => {
    const { container } = render(<NidloMark variant="wordmark-tagline" />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-label")).toContain(
      "Where every stitch begins"
    );
  });

  it("renders only the logo glyph for the logo variant", () => {
    const { container } = render(<NidloMark variant="logo" size={48} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-label")).toBe("Nidlo");
    expect(svg?.getAttribute("height")).toBe("48");
  });
});
