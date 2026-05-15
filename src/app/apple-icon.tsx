import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple touch icon (iOS home-screen install). Same brand mark as
// app/icon.tsx but at the iOS recommended 180x180.
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#1a1612",
        borderRadius: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width="128"
        height="128"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 4 30 C 8 18, 18 14, 28 22 C 34 27, 38 30, 42 30"
          stroke="#d68a4f"
          strokeWidth="2.4"
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
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path d="M 40 14 L 44 10 L 42 16 Z" fill="#fbf7f0" />
        <ellipse
          cx="15.5"
          cy="36.5"
          rx="2.4"
          ry="1.2"
          transform="rotate(-45 15.5 36.5)"
          stroke="#d68a4f"
          strokeWidth="1.8"
          fill="none"
        />
      </svg>
    </div>,
    { ...size }
  );
}
