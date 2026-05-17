import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    draggable,
  }: {
    src: string;
    alt: string;
    draggable?: boolean;
    [k: string]: unknown;
  }) => {
    /* eslint-disable-next-line @next/next/no-img-element */
    return <img src={src} alt={alt} draggable={draggable} />;
  },
}));

import { ImageLightbox, type LightboxImage } from "./image-lightbox";

const IMAGES: LightboxImage[] = [
  { url: "https://ik.imagekit.io/snad/a.jpg", caption: "First" },
  { url: "https://ik.imagekit.io/snad/b.jpg", caption: null },
  { url: "https://ik.imagekit.io/snad/c.jpg", caption: "Third" },
];

/** Drives `index` like a real parent would so wrap-around is observable. */
function Harness({ start = 0 }: { start?: number }) {
  const [index, setIndex] = React.useState<number | null>(start);
  return (
    <ImageLightbox
      images={IMAGES}
      index={index}
      onIndexChange={setIndex}
      onClose={() => setIndex(null)}
    />
  );
}

describe("ImageLightbox", () => {
  it("renders nothing when closed (index null)", () => {
    const { container } = render(
      <ImageLightbox
        images={IMAGES}
        index={null}
        onIndexChange={() => {}}
        onClose={() => {}}
      />
    );
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the selected image and its caption", () => {
    render(<Harness start={0} />);
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://ik.imagekit.io/snad/a.jpg"
    );
    // "First" appears twice: the sr-only DialogTitle and the visible
    // caption <p>. Assert the visible paragraph specifically.
    const visibleCaption = screen
      .getAllByText("First")
      .find((el) => el.tagName === "P");
    expect(visibleCaption).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("cycles forward with the Next button and wraps past the end", () => {
    render(<Harness start={2} />);
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://ik.imagekit.io/snad/c.jpg"
    );
    fireEvent.click(screen.getByRole("button", { name: "Next image" }));
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://ik.imagekit.io/snad/a.jpg"
    );
  });

  it("cycles backward with the Previous button and wraps below zero", () => {
    render(<Harness start={0} />);
    fireEvent.click(screen.getByRole("button", { name: "Previous image" }));
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://ik.imagekit.io/snad/c.jpg"
    );
  });

  it("navigates with the arrow keys", () => {
    render(<Harness start={0} />);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://ik.imagekit.io/snad/b.jpg"
    );
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://ik.imagekit.io/snad/a.jpg"
    );
  });

  it("closes on Escape", () => {
    render(<Harness start={0} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("exposes NO download affordance and NO anchor to the raw file", () => {
    const { container } = render(<Harness start={0} />);
    expect(container.ownerDocument.querySelectorAll("a")).toHaveLength(0);
    expect(container.ownerDocument.querySelectorAll("[download]")).toHaveLength(
      0
    );
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("draggable", "false");
  });

  it("hides the nav row for a single image", () => {
    render(
      <ImageLightbox
        images={[IMAGES[0]]}
        index={0}
        onIndexChange={() => {}}
        onClose={() => {}}
      />
    );
    expect(
      screen.queryByRole("button", { name: "Next image" })
    ).not.toBeInTheDocument();
  });
});
