import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const ensureReadySpy = vi.fn();
const detectImageSpy = vi.fn();
const classifyPoseSpy = vi.fn();
const fileToImageSpy = vi.fn();

vi.mock("@/lib/pose/use-pose-detector", () => ({
  usePoseDetector: () => ({
    status: "idle",
    ensureReady: ensureReadySpy,
    detectImage: detectImageSpy,
  }),
  fileToImage: (f: File) => fileToImageSpy(f),
}));

vi.mock("@/lib/pose/classify-pose", () => ({
  classifyPose: (...args: unknown[]) => classifyPoseSpy(...args),
}));

import { PoseCheckedPhotoField } from "./pose-checked-photo-field";

function pickFile(input: HTMLElement) {
  const file = new File(["x"], "shot.jpg", { type: "image/jpeg" });
  fireEvent.change(input, { target: { files: [file] } });
  return file;
}

beforeEach(() => {
  ensureReadySpy.mockReset().mockResolvedValue(true);
  detectImageSpy.mockReset().mockReturnValue([{ x: 0, y: 0 }]);
  classifyPoseSpy.mockReset().mockReturnValue({ ok: true, issues: [] });
  fileToImageSpy.mockReset().mockResolvedValue({} as HTMLImageElement);
});

describe("<PoseCheckedPhotoField />", () => {
  it("accepts the file immediately on pick (never blocks on the check)", async () => {
    const onChange = vi.fn();
    render(
      <PoseCheckedPhotoField
        id="front"
        label="Front photo"
        variant="front"
        file={null}
        onChange={onChange}
      />
    );
    const input = document.getElementById("front")!;
    const file = pickFile(input);
    // onChange fires synchronously, before any async pose check resolves.
    expect(onChange).toHaveBeenCalledWith(file);
    // Let the async check settle so the post-pick state update doesn't
    // land outside act() and warn.
    await waitFor(() => expect(classifyPoseSpy).toHaveBeenCalled());
  });

  it("shows a dismissible warning when the pose check fails", async () => {
    classifyPoseSpy.mockReturnValue({
      ok: false,
      issues: ["Move your arms out, away from your sides."],
    });
    render(
      <PoseCheckedPhotoField
        id="front"
        label="Front photo"
        variant="front"
        file={null}
        onChange={vi.fn()}
      />
    );
    pickFile(document.getElementById("front")!);

    await waitFor(() =>
      expect(
        screen.getByText(/doesn't look like the front photo/i)
      ).toBeInTheDocument()
    );
    expect(screen.getByText(/move your arms out/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /use anyway/i }));
    await waitFor(() =>
      expect(
        screen.queryByText(/doesn't look like the front photo/i)
      ).not.toBeInTheDocument()
    );
  });

  it("stays silent when the pose check passes", async () => {
    render(
      <PoseCheckedPhotoField
        id="front"
        label="Front photo"
        variant="front"
        file={null}
        onChange={vi.fn()}
      />
    );
    pickFile(document.getElementById("front")!);
    await waitFor(() => expect(classifyPoseSpy).toHaveBeenCalled());
    expect(screen.queryByText(/doesn't look like/i)).not.toBeInTheDocument();
  });

  it("skips the check (no warning) when the model can't load", async () => {
    ensureReadySpy.mockResolvedValue(false);
    classifyPoseSpy.mockReturnValue({ ok: false, issues: ["x"] });
    render(
      <PoseCheckedPhotoField
        id="front"
        label="Front photo"
        variant="front"
        file={null}
        onChange={vi.fn()}
      />
    );
    pickFile(document.getElementById("front")!);
    await waitFor(() => expect(ensureReadySpy).toHaveBeenCalled());
    // Model unavailable -> we never classify, never warn.
    expect(classifyPoseSpy).not.toHaveBeenCalled();
    expect(screen.queryByText(/doesn't look like/i)).not.toBeInTheDocument();
  });

  it("renders the required asterisk when required", () => {
    render(
      <PoseCheckedPhotoField
        id="front"
        label="Front photo"
        variant="front"
        required
        file={null}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByLabelText("required")).toBeInTheDocument();
  });
});
