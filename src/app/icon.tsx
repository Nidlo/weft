import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Next 16 file-based icon route. Renders the Nidlo needle+thread mark at
// 32x32 for browser tab/bookmark use. Shapes mirror
// src/components/brand/nidlo-mark.tsx so the favicon and in-app mark
// stay visually consistent (Q-11). Edge runtime keeps the response cheap
// at the CDN; Next caches the result.
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#1a1612",
        borderRadius: 7,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 4 30 C 8 18, 18 14, 28 22 C 34 27, 38 30, 42 30"
          stroke="#d68a4f"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="3 3"
          fill="none"
        />
        <line
          x1="14"
          y1="38"
          x2="40"
          y2="14"
          stroke="#fbf7f0"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M 40 14 L 44 10 L 42 16 Z" fill="#fbf7f0" />
      </svg>
    </div>,
    { ...size }
  );
}
