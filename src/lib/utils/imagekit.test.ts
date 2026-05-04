import { describe, it, expect } from "vitest";
import { getImageKitThumbnail } from "./imagekit";

const ENDPOINT = "https://ik.imagekit.io/snad";

describe("getImageKitThumbnail", () => {
  it("returns non-ImageKit URLs untouched", () => {
    const url = "https://example.com/foo.jpg";
    expect(getImageKitThumbnail(url, 400)).toBe(url);
  });

  it("inserts a transform segment after the endpoint for a clean URL", () => {
    const url = `${ENDPOINT}/portfolio/x.jpg`;
    expect(getImageKitThumbnail(url, 400)).toBe(
      `${ENDPOINT}/tr:w-400,h-400,c-maintain_ratio,fo-auto/portfolio/x.jpg`
    );
  });

  it("uses the requested width", () => {
    const url = `${ENDPOINT}/avatar.jpg`;
    expect(getImageKitThumbnail(url, 64)).toBe(
      `${ENDPOINT}/tr:w-64,h-64,c-maintain_ratio,fo-auto/avatar.jpg`
    );
  });

  it("strips an existing transform segment instead of chaining", () => {
    const url = `${ENDPOINT}/tr:w-100,h-100/portfolio/x.jpg`;
    expect(getImageKitThumbnail(url, 400)).toBe(
      `${ENDPOINT}/tr:w-400,h-400,c-maintain_ratio,fo-auto/portfolio/x.jpg`
    );
  });

  it("strips a more elaborate transform segment", () => {
    const url = `${ENDPOINT}/tr:w-300,h-300,c-maintain_ratio,fo-auto/portfolio/x.jpg`;
    expect(getImageKitThumbnail(url, 800)).toBe(
      `${ENDPOINT}/tr:w-800,h-800,c-maintain_ratio,fo-auto/portfolio/x.jpg`
    );
  });

  it("re-inserts the leading slash when the path is missing one after stripping", () => {
    // Pathological input: tr segment with no following slash.
    const url = `${ENDPOINT}/tr:w-100/file.jpg`;
    const result = getImageKitThumbnail(url, 400);
    expect(result).toBe(
      `${ENDPOINT}/tr:w-400,h-400,c-maintain_ratio,fo-auto/file.jpg`
    );
  });

  it("uses default width 400 when omitted", () => {
    const url = `${ENDPOINT}/foo.jpg`;
    expect(getImageKitThumbnail(url)).toContain("tr:w-400,h-400");
  });
});
