import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Nidlo. Where every stitch begins";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand tokens, kept in sync with globals.css (--background, --foreground,
// --copper) and with the mark in public/icons/icon-192x192.svg.
const BONE = "#fbf7f0";
const INK = "#1a1612";
const COPPER = "#d68a4f";
const MUTED = "#8a7f6b";

/**
 * Root share card. Bone surface, the needle+thread mark on a dark tile,
 * wordmark and tagline. Path data mirrors NidloMark / icon-192x192.svg so
 * the OG card, favicon, and in-app mark stay visually identical (Q-11).
 */
export default async function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 56,
        background: BONE,
        color: INK,
        fontFamily: "system-ui, sans-serif",
        padding: 80,
      }}
    >
      {/* Brand mark on a dark tile, matches apple-icon.tsx + icon-192x192.svg. */}
      <div
        style={{
          width: 320,
          height: 320,
          borderRadius: 64,
          background: INK,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg
          width="220"
          height="220"
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 4 30 C 8 18, 18 14, 28 22 C 34 27, 38 30, 42 30"
            stroke={COPPER}
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
            stroke={BONE}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path d="M 40 14 L 44 10 L 42 16 Z" fill={BONE} />
          <ellipse
            cx="15.5"
            cy="36.5"
            rx="2.4"
            ry="1.2"
            transform="rotate(-45 15.5 36.5)"
            stroke={COPPER}
            strokeWidth="1.8"
            fill="none"
          />
        </svg>
      </div>

      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div
          style={{
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: COPPER,
            display: "flex",
          }}
        >
          Where every stitch begins
        </div>
        <div
          style={{
            fontSize: 168,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: -4,
            marginTop: 18,
            display: "flex",
          }}
        >
          Nidlo
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 30,
            lineHeight: 1.35,
            color: MUTED,
            maxWidth: 640,
            display: "flex",
          }}
        >
          Custom fashion. Connecting you with seamstresses, tailors, and
          designers anywhere.
        </div>
      </div>
    </div>,
    { ...size }
  );
}
