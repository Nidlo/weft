import { describe, it, expect, vi } from "vitest";

// Capture the JSX tree passed to ImageResponse instead of trying to spin
// up an Edge runtime renderer inside jsdom. We assert the static metadata
// (size, alt, content-type) and that the JSX includes the brand mark and
// copy.
const captured: { tree: unknown; options: unknown } = {
  tree: null,
  options: null,
};

vi.mock("next/og", () => ({
  ImageResponse: class {
    constructor(tree: unknown, options: unknown) {
      captured.tree = tree;
      captured.options = options;
    }
  },
}));

import OgImage, { size, alt, contentType, runtime } from "../opengraph-image";

function flatten(node: unknown): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(flatten).join(" ");
  if (typeof node === "object" && node !== null && "props" in node) {
    const props = (node as { props?: { children?: unknown } }).props ?? {};
    return flatten(props.children);
  }
  return "";
}

describe("root opengraph-image", () => {
  it("exposes the expected file-convention metadata", () => {
    expect(runtime).toBe("edge");
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(contentType).toBe("image/png");
    expect(alt).toContain("Nidlo");
  });

  it("renders the brand wordmark and tagline", async () => {
    await OgImage();
    const text = flatten(captured.tree);
    expect(text).toContain("Nidlo");
    expect(text).toContain("Where every stitch begins");
  });

  it("draws the needle+thread mark (same path data as the favicon)", async () => {
    await OgImage();
    const json = JSON.stringify(captured.tree);
    // Thread arc + needle shaft path fragments from nidlo-mark.tsx.
    expect(json).toContain("M 4 30 C 8 18, 18 14, 28 22");
    expect(json).toContain("M 40 14 L 44 10 L 42 16 Z");
  });
});
