/**
 * Pure pose-classification logic. Kept dependency-free (no MediaPipe import)
 * so it unit-tests against plain landmark fixtures and could run anywhere.
 *
 * Input is the 33-point BlazePose/MediaPipe landmark array. We only read a
 * handful of joints; everything is normalised (x,y in 0..1 of the frame,
 * origin top-left). `visibility` is MediaPipe's 0..1 confidence the joint
 * is actually in-frame and not occluded.
 *
 * The goal is a *non-blocking nudge*, not a gate. We catch the four
 * mistakes that wreck a Fitscan run -- not-front-on, not-side-on,
 * arms-wrong (T-pose or glued to sides), and body cut off -- and stay
 * quiet on anything borderline. Fitscan's server-side `degradedModes`
 * remains the source of truth.
 */

/** MediaPipe pose landmark indices we care about. */
const L = {
  nose: 0,
  leftShoulder: 11,
  rightShoulder: 12,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftAnkle: 27,
  rightAnkle: 28,
} as const;

export interface PoseLandmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export type PoseVariant = "front" | "side";

export interface PoseClassification {
  /** True when the pose is close enough that we stay silent. */
  ok: boolean;
  /**
   * Human-readable, fixable problems. Empty when `ok`. First entry is the
   * most important - callers may surface only `issues[0]`.
   */
  issues: string[];
}

const VISIBLE = 0.5;

function visible(p: PoseLandmark | undefined): p is PoseLandmark {
  return !!p && (p.visibility ?? 1) >= VISIBLE;
}

function midX(a: PoseLandmark, b: PoseLandmark): number {
  return (a.x + b.x) / 2;
}

/**
 * Classify a detected pose against the expected Fitscan stance.
 *
 * Front (A-pose): facing camera, arms angled down-and-out ~45° from the
 * body, full body in frame. Side: 90° profile so shoulders stack (narrow
 * silhouette), arms extended forward, full body in frame.
 */
export function classifyPose(
  landmarks: PoseLandmark[] | null | undefined,
  variant: PoseVariant
): PoseClassification {
  if (!landmarks || landmarks.length < 33) {
    return {
      ok: false,
      issues: [
        "We couldn't find a clear single body. Step back and try again.",
      ],
    };
  }

  const nose = landmarks[L.nose];
  const lSh = landmarks[L.leftShoulder];
  const rSh = landmarks[L.rightShoulder];
  const lWr = landmarks[L.leftWrist];
  const rWr = landmarks[L.rightWrist];
  const lHip = landmarks[L.leftHip];
  const rHip = landmarks[L.rightHip];
  const lAnk = landmarks[L.leftAnkle];
  const rAnk = landmarks[L.rightAnkle];

  const issues: string[] = [];

  // --- Full body in frame ---
  // Head must be visible and at least one ankle, and the head-to-ankle
  // vertical span should cover most of the frame (body not cropped).
  const headVisible = visible(nose);
  const anyAnkleVisible = visible(lAnk) || visible(rAnk);
  const lowestAnkleY = Math.max(
    visible(lAnk) ? lAnk.y : 0,
    visible(rAnk) ? rAnk.y : 0
  );
  const verticalSpan = headVisible ? lowestAnkleY - nose.y : 0;
  if (!headVisible || !anyAnkleVisible || verticalSpan < 0.55) {
    issues.push("Keep your whole body in frame, head to feet.");
  }

  // Need both shoulders to reason about orientation/arms at all.
  if (!visible(lSh) || !visible(rSh)) {
    issues.push("Face the camera so both shoulders are visible.");
    return { ok: false, issues };
  }

  // Shoulder span as a fraction of frame width is our orientation proxy:
  // wide when front-on, collapses toward ~0 when side-on (one shoulder
  // occludes the other).
  const shoulderSpan = Math.abs(lSh.x - rSh.x);

  if (variant === "front") {
    if (shoulderSpan < 0.14) {
      issues.push("Turn to face the camera straight on.");
    }
    // Arms: in an A-pose the wrists sit BELOW the shoulders and OUTSIDE
    // the torso (further from body centre-line than the shoulders).
    const centre =
      visible(lHip) && visible(rHip) ? midX(lHip, rHip) : midX(lSh, rSh);
    const shoulderY = (lSh.y + rSh.y) / 2;

    const armState = (
      wrist: PoseLandmark | undefined,
      shoulder: PoseLandmark
    ): "ok" | "down" | "raised" | "unknown" => {
      if (!visible(wrist)) return "unknown";
      const below = wrist.y > shoulderY + 0.04;
      const outwardOfShoulder =
        Math.abs(wrist.x - centre) >= Math.abs(shoulder.x - centre) - 0.03;
      if (!below) return "raised"; // wrist at/above shoulder => T-pose-ish
      if (!outwardOfShoulder) return "down"; // hanging straight at sides
      return "ok";
    };

    const left = armState(lWr, lSh);
    const right = armState(rWr, rSh);
    const states = [left, right];
    if (states.includes("raised")) {
      issues.push("Lower your arms to about 45° from your sides.");
    } else if (states.every((s) => s === "down")) {
      issues.push("Move your arms out, away from your sides.");
    }
  } else {
    // Side: shoulders should stack -> narrow span. A wide span means
    // they're still facing the camera.
    if (shoulderSpan > 0.16) {
      issues.push("Turn 90° so the camera sees your side.");
    }
    // Arms forward: at least one wrist clearly horizontally displaced
    // from the shoulder line (reaching forward), roughly shoulder height.
    const shoulderX = midX(lSh, rSh);
    const shoulderY = (lSh.y + rSh.y) / 2;
    const reaching = [lWr, rWr].some((w) => {
      if (!visible(w)) return false;
      const forward = Math.abs(w.x - shoulderX) > 0.12;
      const aboutShoulderHeight = Math.abs(w.y - shoulderY) < 0.22;
      return forward && aboutShoulderHeight;
    });
    if (!reaching) {
      issues.push("Stretch your arms straight forward at shoulder height.");
    }
  }

  return { ok: issues.length === 0, issues };
}
