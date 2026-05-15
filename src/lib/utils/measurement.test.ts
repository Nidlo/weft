import { describe, it, expect } from "vitest";
import {
  cmToInches,
  inchesToCm,
  mmToCm,
  cmToMm,
  mmToInches,
  inchesToMm,
  convertMeasurement,
  convertMeasurementData,
  formatMeasurement,
  unitLabel,
  unitName,
  checkBounds,
  classifyRescanDelta,
  RESCAN_AUTO_THRESHOLD_MM,
  RESCAN_REJECT_THRESHOLD_MM,
  recomputeFromLandmarks,
} from "./measurement";

describe("cmToInches / inchesToCm", () => {
  it("round-trips without drift beyond float precision", () => {
    expect(cmToInches(2.54)).toBeCloseTo(1, 6);
    expect(inchesToCm(1)).toBeCloseTo(2.54, 6);
  });

  it("converts a typical body measurement", () => {
    expect(cmToInches(91.44)).toBeCloseTo(36, 4);
    expect(inchesToCm(36)).toBeCloseTo(91.44, 4);
  });
});

describe("convertMeasurement", () => {
  it("returns the value unchanged when units match", () => {
    expect(convertMeasurement(50, "cm", "cm")).toBe(50);
    expect(convertMeasurement(20, "inches", "inches")).toBe(20);
    expect(convertMeasurement(914, "mm", "mm")).toBe(914);
  });

  it("converts cm to inches", () => {
    expect(convertMeasurement(2.54, "cm", "inches")).toBeCloseTo(1, 6);
  });

  it("converts inches to cm", () => {
    expect(convertMeasurement(10, "inches", "cm")).toBeCloseTo(25.4, 6);
  });

  it("converts mm to cm", () => {
    expect(convertMeasurement(914, "mm", "cm")).toBeCloseTo(91.4, 6);
  });

  it("converts mm to inches", () => {
    expect(convertMeasurement(914, "mm", "inches")).toBeCloseTo(36, 1);
  });

  it("converts cm to mm and rounds to integer", () => {
    expect(convertMeasurement(91.44, "cm", "mm")).toBe(914);
  });

  it("converts inches to mm via cm", () => {
    expect(convertMeasurement(36, "inches", "mm")).toBe(914);
  });
});

describe("mm conversion helpers", () => {
  it("round-trips cm ↔ mm without loss for whole-mm inputs", () => {
    expect(cmToMm(91.4)).toBe(914);
    expect(mmToCm(914)).toBeCloseTo(91.4, 6);
  });

  it("round-trips inches ↔ mm with expected integer-rounding behaviour", () => {
    // 36 in × 2.54 × 10 = 914.4 → rounds to 914 → back to 35.984... in
    expect(inchesToMm(36)).toBe(914);
    expect(mmToInches(914)).toBeCloseTo(35.98, 1);
  });
});

describe("formatMeasurement", () => {
  it("returns em-dash for null/undefined/NaN", () => {
    expect(formatMeasurement(null, "cm", "inches")).toBe("-");
    expect(formatMeasurement(undefined, "cm", "inches")).toBe("-");
    expect(formatMeasurement(NaN, "cm", "inches")).toBe("-");
  });

  it("formats with the display unit suffix by default", () => {
    expect(formatMeasurement(91.44, "cm", "inches")).toBe("36.0 in");
    expect(formatMeasurement(36, "inches", "cm")).toBe("91.4 cm");
  });

  it("omits the unit when withUnit is false", () => {
    expect(formatMeasurement(91.44, "cm", "inches", { withUnit: false })).toBe(
      "36.0"
    );
  });

  it("respects an explicit digits override", () => {
    expect(formatMeasurement(91.44, "cm", "inches", { digits: 2 })).toBe(
      "36.00 in"
    );
  });

  it("formats from mm storage to inches display", () => {
    expect(formatMeasurement(914, "mm", "inches")).toBe("36.0 in");
  });

  it("formats from mm storage to cm display", () => {
    expect(formatMeasurement(914, "mm", "cm")).toBe("91.4 cm");
  });
});

describe("unitLabel / unitName", () => {
  it("returns short labels suitable for inputs", () => {
    expect(unitLabel("cm")).toBe("cm");
    expect(unitLabel("inches")).toBe("in");
  });

  it("returns full names suitable for accessibility text", () => {
    expect(unitName("cm")).toBe("Centimeters");
    expect(unitName("inches")).toBe("Inches");
  });
});

describe("convertMeasurementData", () => {
  it("returns an empty object for null/undefined payload", () => {
    expect(convertMeasurementData(null, "mm", "cm")).toEqual({});
    expect(convertMeasurementData(undefined, "mm", "cm")).toEqual({});
  });

  it("walks the section/field shape and converts mm to cm", () => {
    const payload = {
      upper_body: { bust: 914, waist: 720 },
      lower_body: { hips: 1000 },
    };
    expect(convertMeasurementData(payload, "mm", "cm")).toEqual({
      upper_body: { bust: 91.4, waist: 72 },
      lower_body: { hips: 100 },
    });
  });

  it("converts mm to inches and rounds to 1 decimal", () => {
    const payload = { upper_body: { bust: 914 } };
    expect(convertMeasurementData(payload, "mm", "inches")).toEqual({
      upper_body: { bust: 36 },
    });
  });

  it("preserves nulls and skips missing sections", () => {
    const payload = {
      upper_body: { bust: 914, waist: null },
      lower_body: undefined,
    };
    expect(convertMeasurementData(payload, "mm", "cm")).toEqual({
      upper_body: { bust: 91.4, waist: null },
    });
  });

  it("passes the payload through when units match", () => {
    const payload = { upper_body: { bust: 914 } };
    expect(convertMeasurementData(payload, "mm", "mm")).toEqual({
      upper_body: { bust: 914 },
    });
  });
});

describe("classifyRescanDelta", () => {
  it("returns prompt when either side is null", () => {
    expect(classifyRescanDelta(null, 914)).toBe("prompt");
    expect(classifyRescanDelta(914, null)).toBe("prompt");
    expect(classifyRescanDelta(null, null)).toBe("prompt");
  });

  it("returns auto for |delta| < auto threshold", () => {
    expect(classifyRescanDelta(914, 914 + RESCAN_AUTO_THRESHOLD_MM - 1)).toBe(
      "auto"
    );
    expect(classifyRescanDelta(914, 914)).toBe("auto");
  });

  it("returns prompt for auto <= |delta| < reject threshold", () => {
    expect(classifyRescanDelta(914, 914 + RESCAN_AUTO_THRESHOLD_MM)).toBe(
      "prompt"
    );
    expect(classifyRescanDelta(914, 914 + RESCAN_REJECT_THRESHOLD_MM - 1)).toBe(
      "prompt"
    );
  });

  it("returns reject for |delta| >= reject threshold", () => {
    expect(classifyRescanDelta(914, 914 + RESCAN_REJECT_THRESHOLD_MM)).toBe(
      "reject"
    );
    expect(classifyRescanDelta(914, 914 + 200)).toBe("reject");
  });

  it("treats negative deltas the same way (absolute value)", () => {
    expect(classifyRescanDelta(914, 914 - RESCAN_REJECT_THRESHOLD_MM)).toBe(
      "reject"
    );
    expect(classifyRescanDelta(914, 914 - 5)).toBe("auto");
  });
});

describe("recomputeFromLandmarks", () => {
  // Helper to build a landmark with high visibility - saves boilerplate.
  const lm = (x: number, y: number) => ({ x, y, visibility: 1.0 });

  // Pose with all the landmarks the helper consults. Picture a 6-foot
  // person: ears at y=0.05 (head top proxy), foot_index at y=0.95.
  // pixelHeight = 0.90. Baseline full_height = 1800 mm → mmPerPx = 2000.
  const fullPose = {
    left_ear: lm(0.48, 0.05),
    right_ear: lm(0.52, 0.05),
    left_shoulder: lm(0.4, 0.2),
    right_shoulder: lm(0.6, 0.2),
    left_wrist: lm(0.3, 0.5),
    right_wrist: lm(0.7, 0.5),
    left_hip: lm(0.45, 0.55),
    right_hip: lm(0.55, 0.55),
    left_knee: lm(0.45, 0.75),
    right_knee: lm(0.55, 0.75),
    left_ankle: lm(0.45, 0.93),
    right_ankle: lm(0.55, 0.93),
    left_foot_index: lm(0.45, 0.95),
    right_foot_index: lm(0.55, 0.95),
  };

  const baseline = {
    vertical: { full_height: 1800 },
  };

  it("returns an empty object when landmarks are null", () => {
    expect(recomputeFromLandmarks(null, baseline)).toEqual({});
  });

  it("returns an empty object when baseline is null", () => {
    expect(recomputeFromLandmarks(fullPose, null)).toEqual({});
  });

  it("returns an empty object when baseline lacks full_height", () => {
    expect(
      recomputeFromLandmarks(fullPose, { upper_body: { bust: 900 } })
    ).toEqual({});
  });

  it("returns an empty object when head/foot landmarks are missing", () => {
    const partial = { ...fullPose };
    delete (partial as Record<string, unknown>).left_ear;
    expect(recomputeFromLandmarks(partial, baseline)).toEqual({});
  });

  it("recomputes shoulder width from left/right shoulder distance", () => {
    // shoulders at (0.4, 0.2) and (0.6, 0.2) → pixel distance 0.2
    // mmPerPx = 1800 / 0.9 = 2000
    // shoulder = 0.2 × 2000 = 400 mm (40 cm - adult-shoulder territory)
    const result = recomputeFromLandmarks(fullPose, baseline);
    expect(result.upper_body?.shoulder).toBe(400);
  });

  it("recomputes arm_length from left shoulder→wrist", () => {
    // left_shoulder (0.4, 0.2) → left_wrist (0.3, 0.5)
    // distance = sqrt(0.01 + 0.09) = sqrt(0.1) ≈ 0.3162
    // ≈ 632.5 mm
    const result = recomputeFromLandmarks(fullPose, baseline);
    expect(result.upper_body?.arm_length).toBeGreaterThan(600);
    expect(result.upper_body?.arm_length).toBeLessThan(650);
  });

  it("recomputes inseam from left hip→ankle", () => {
    // left_hip (0.45, 0.55) → left_ankle (0.45, 0.93)
    // distance = sqrt(0 + 0.1444) = 0.38 → ≈ 760 mm
    const result = recomputeFromLandmarks(fullPose, baseline);
    expect(result.lower_body?.inseam).toBeGreaterThan(750);
    expect(result.lower_body?.inseam).toBeLessThan(770);
  });

  it("recomputes vertical full_height from current head-to-foot span", () => {
    // ears y=0.05, foot_index y=0.95 → 0.9 → × 2000 = 1800
    const result = recomputeFromLandmarks(fullPose, baseline);
    expect(result.vertical?.full_height).toBe(1800);
  });

  it("recomputes shoulder_to_waist as a vertical span", () => {
    // shoulder-mid y=0.2, hip-mid y=0.55 → 0.35 → × 2000 = 700 mm
    const result = recomputeFromLandmarks(fullPose, baseline);
    expect(result.vertical?.shoulder_to_waist).toBe(700);
  });

  it("recomputes waist_to_knee as a vertical span", () => {
    // hip-mid y=0.55, knee-mid y=0.75 → 0.20 → × 2000 = 400 mm
    const result = recomputeFromLandmarks(fullPose, baseline);
    expect(result.vertical?.waist_to_knee).toBe(400);
  });

  it("falls back to right side when left wrist is missing", () => {
    const noLeftWrist = { ...fullPose };
    delete (noLeftWrist as Record<string, unknown>).left_wrist;
    const result = recomputeFromLandmarks(noLeftWrist, baseline);
    // arm_length still computed from right side
    expect(result.upper_body?.arm_length).toBeGreaterThan(0);
  });

  it("falls back to ankle when foot_index is missing", () => {
    const noFootIndex = { ...fullPose };
    delete (noFootIndex as Record<string, unknown>).left_foot_index;
    delete (noFootIndex as Record<string, unknown>).right_foot_index;
    // ankles at y=0.93 - slightly shorter than foot_index, but recompute
    // still works
    const result = recomputeFromLandmarks(noFootIndex, baseline);
    expect(result.vertical?.full_height).toBeGreaterThan(0);
  });

  it("scaling propagates: dragging the foot lower scales all distance fields proportionally", () => {
    // Foot dragged from 0.95 → 0.99 (extra 4% of frame)
    const dragged = {
      ...fullPose,
      left_foot_index: lm(0.45, 0.99),
      right_foot_index: lm(0.55, 0.99),
    };
    // Head→foot pixel distance: 0.94 (was 0.9)
    // mmPerPx = 1800 / 0.94 ≈ 1914.9
    // shoulder pixel = 0.2 → 382 mm (vs 400 before - proportional shrink)
    const result = recomputeFromLandmarks(dragged, baseline);
    expect(result.upper_body?.shoulder).toBeLessThan(400);
    expect(result.upper_body?.shoulder).toBeGreaterThan(370);
  });

  // Sprint 36 booth-coverage. Pins the contract that dragging shoulder
  // or hip landmarks moves the booth-standard fields the manual form now
  // exposes (Across Back / Across Chest, Shoulder to Hip, Nape to Waist,
  // Waist to Floor). Failure here means the user drag-then-look-at-the-
  // form loop is broken again.

  it("recomputes waist_to_floor from hip-mid → foot-mid", () => {
    // hip-mid y=0.55, foot-mid y=0.95 → 0.40 → × 2000 = 800 mm
    const result = recomputeFromLandmarks(fullPose, baseline);
    expect(result.vertical?.waist_to_floor).toBe(800);
  });

  it("recomputes shoulder_to_hip distinct from shoulder_to_waist", () => {
    // shoulder-mid y=0.2, hip-mid y=0.55 → 0.35 → × 2000 = 700 mm.
    // In this synthetic pose hip-mid IS the waist proxy, so the two
    // values match - but the field still has to be populated, not
    // skipped. Verifies the helper actually writes the key.
    const result = recomputeFromLandmarks(fullPose, baseline);
    expect(result.vertical?.shoulder_to_hip).toBe(700);
  });

  it("recomputes nape_to_waist using ear-mid as the C7 proxy", () => {
    // ear-mid y=0.05, hip-mid y=0.55 → 0.50 → × 2000 = 1000 mm
    const result = recomputeFromLandmarks(fullPose, baseline);
    expect(result.upper_body?.back_length).toBe(1000);
  });

  it("derives across_chest and across_back as ratios of shoulder width", () => {
    // shoulder width = 0.2 × 2000 = 400 mm
    // across_chest = 0.85 × 400 = 340 mm
    // across_back  = 0.90 × 400 = 360 mm
    const result = recomputeFromLandmarks(fullPose, baseline);
    expect(result.upper_body?.across_chest).toBe(340);
    expect(result.upper_body?.across_back).toBe(360);
  });
});

describe("checkBounds", () => {
  it("returns null for an in-range value in cm", () => {
    expect(checkBounds("waist", 80, "cm")).toBeNull();
  });

  it("returns a warning when a cm value is below the typical range", () => {
    const result = checkBounds("waist", 30, "cm");
    expect(result).not.toBeNull();
    expect(result).toContain("cm");
  });

  it("returns a warning when an inches value is above typical range", () => {
    // 100 in ≈ 254 cm, well above the 160 cm waist max
    const result = checkBounds("waist", 100, "inches");
    expect(result).not.toBeNull();
    expect(result).toContain("in");
  });

  it("returns null for unknown fields", () => {
    expect(checkBounds("not_a_real_field", 50, "cm")).toBeNull();
  });
});
