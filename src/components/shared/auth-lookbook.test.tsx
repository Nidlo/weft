import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { AuthLookbook, AuthTagMarquee } from "./auth-lookbook";

describe("AuthLookbook", () => {
  it("renders a non-empty marquee track", () => {
    const { container } = render(<AuthLookbook />);
    // 12 tiles × 2 (duplicated for seamless loop) = 24 articles
    expect(container.querySelectorAll("article").length).toBe(24);
  });

  it("respects the direction prop (no crash on either)", () => {
    const up = render(<AuthLookbook direction="up" />);
    const down = render(<AuthLookbook direction="down" />);
    expect(up.container.querySelector("article")).toBeInTheDocument();
    expect(down.container.querySelector("article")).toBeInTheDocument();
  });

  it("hides decorative content from assistive tech", () => {
    const { container } = render(<AuthLookbook />);
    // Wrapper marked aria-hidden because tiles are purely decorative.
    expect(container.firstChild).toHaveAttribute("aria-hidden");
  });
});

describe("AuthTagMarquee", () => {
  it("renders the looped tag list", () => {
    const { container } = render(<AuthTagMarquee />);
    // 12 tags × 2 = 24 spans inside the track
    const spans = container.querySelectorAll("span.inline-flex");
    expect(spans.length).toBe(24);
  });

  it("hides the marquee from assistive tech", () => {
    const { container } = render(<AuthTagMarquee />);
    expect(container.firstChild).toHaveAttribute("aria-hidden");
  });
});
