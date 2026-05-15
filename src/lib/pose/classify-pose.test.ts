import { describe, it, expect } from "vitest";

import { classifyPose, type PoseLandmark } from "./classify-pose";

/**
 * Build a 33-point landmark array. Indices not set explicitly get a
 * sensible visible default so only the joints under test matter.
 */
function makeLandmarks(
  overrides: Record<number, Partial<PoseLandmark>>
): PoseLandmark[] {
  const base: PoseLandmark = { x: 0.5, y: 0.5, visibility: 0.9 };
  const arr: PoseLandmark[] = Array.from({ length: 33 }, () => ({ ...base }));
  for (const [i, v] of Object.entries(overrides)) {
    arr[Number(i)] = { ...base, ...v };
  }
  return arr;
}

// A correct front A-pose: facing camera (wide shoulders), arms below +
// outside the shoulders, full body head-to-ankle.
function frontApose(): PoseLandmark[] {
  return makeLandmarks({
    0: { x: 0.5, y: 0.08 }, // nose
    11: { x: 0.4, y: 0.25 }, // left shoulder
    12: { x: 0.6, y: 0.25 }, // right shoulder
    15: { x: 0.28, y: 0.46 }, // left wrist - below + outside
    16: { x: 0.72, y: 0.46 }, // right wrist
    23: { x: 0.45, y: 0.55 }, // left hip
    24: { x: 0.55, y: 0.55 }, // right hip
    27: { x: 0.46, y: 0.93 }, // left ankle
    28: { x: 0.54, y: 0.93 }, // right ankle
  });
}

// A correct side profile: shoulders stacked (narrow span), one arm
// reaching forward at ~shoulder height, full body.
function sideProfile(): PoseLandmark[] {
  return makeLandmarks({
    0: { x: 0.52, y: 0.08 },
    11: { x: 0.5, y: 0.25 },
    12: { x: 0.52, y: 0.25 }, // span 0.02 - stacked
    15: { x: 0.72, y: 0.27 }, // wrist reaching forward, ~shoulder height
    16: { x: 0.73, y: 0.27 },
    23: { x: 0.5, y: 0.55 },
    24: { x: 0.52, y: 0.55 },
    27: { x: 0.5, y: 0.93 },
    28: { x: 0.5, y: 0.93 },
  });
}

describe("classifyPose - front", () => {
  it("passes a correct A-pose", () => {
    const r = classifyPose(frontApose(), "front");
    expect(r.ok).toBe(true);
    expect(r.issues).toEqual([]);
  });

  it("flags a T-pose (arms raised to shoulder height)", () => {
    const lm = frontApose();
    lm[15] = { x: 0.2, y: 0.25, visibility: 0.9 }; // wrist at shoulder Y
    lm[16] = { x: 0.8, y: 0.25, visibility: 0.9 };
    const r = classifyPose(lm, "front");
    expect(r.ok).toBe(false);
    expect(r.issues.join(" ")).toMatch(/lower your arms/i);
  });

  it("flags arms hanging straight at the sides", () => {
    const lm = frontApose();
    // Wrists below shoulders but NOT outside them (tucked at centre line).
    lm[15] = { x: 0.47, y: 0.5, visibility: 0.9 };
    lm[16] = { x: 0.53, y: 0.5, visibility: 0.9 };
    const r = classifyPose(lm, "front");
    expect(r.ok).toBe(false);
    expect(r.issues.join(" ")).toMatch(/away from your sides/i);
  });

  it("flags a sideways stance when a front pose is expected", () => {
    const lm = frontApose();
    lm[11] = { x: 0.5, y: 0.25, visibility: 0.9 };
    lm[12] = { x: 0.52, y: 0.25, visibility: 0.9 }; // collapsed span
    const r = classifyPose(lm, "front");
    expect(r.ok).toBe(false);
    expect(r.issues.join(" ")).toMatch(/face the camera/i);
  });

  it("flags a cropped body (no ankles in frame)", () => {
    const lm = frontApose();
    lm[27] = { x: 0.46, y: 0.93, visibility: 0.1 };
    lm[28] = { x: 0.54, y: 0.93, visibility: 0.1 };
    const r = classifyPose(lm, "front");
    expect(r.ok).toBe(false);
    expect(r.issues.join(" ")).toMatch(/whole body in frame/i);
  });

  it("returns a friendly message when no landmarks are detected", () => {
    expect(classifyPose(null, "front").ok).toBe(false);
    expect(classifyPose([], "front").issues[0]).toMatch(
      /couldn't find a clear single body/i
    );
  });
});

describe("classifyPose - side", () => {
  it("passes a correct profile pose", () => {
    const r = classifyPose(sideProfile(), "side");
    expect(r.ok).toBe(true);
    expect(r.issues).toEqual([]);
  });

  it("flags facing the camera when a side pose is expected", () => {
    const lm = sideProfile();
    lm[11] = { x: 0.4, y: 0.25, visibility: 0.9 };
    lm[12] = { x: 0.6, y: 0.25, visibility: 0.9 }; // wide span = facing
    const r = classifyPose(lm, "side");
    expect(r.ok).toBe(false);
    expect(r.issues.join(" ")).toMatch(/turn 90/i);
  });

  it("flags arms not reaching forward", () => {
    const lm = sideProfile();
    lm[15] = { x: 0.5, y: 0.55, visibility: 0.9 }; // arm down, not forward
    lm[16] = { x: 0.51, y: 0.55, visibility: 0.9 };
    const r = classifyPose(lm, "side");
    expect(r.ok).toBe(false);
    expect(r.issues.join(" ")).toMatch(/forward at shoulder height/i);
  });
});
