import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Nidlo. Where every stitch begins";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Root OG image. Used as the share card for any route that doesn't define
 * its own `opengraph-image.tsx` (currently only `/designer/[slug]` has one).
 * Static brand card, generated at the edge.
 */
export default async function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        // Brand purple → softer accent gradient.
        background:
          "linear-gradient(135deg, #6b21a8 0%, #4c1d95 50%, #1e1b4b 100%)",
        color: "white",
        fontFamily: "system-ui, sans-serif",
        padding: 64,
        textAlign: "center",
      }}
    >
      {/* Tagline above wordmark, the way the home hero composes it. */}
      <div
        style={{
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: 6,
          textTransform: "uppercase",
          opacity: 0.85,
          marginBottom: 24,
          display: "flex",
        }}
      >
        Where every stitch begins
      </div>
      <div
        style={{
          fontSize: 156,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: -2,
          display: "flex",
        }}
      >
        NIDLO
      </div>
      <div
        style={{
          marginTop: 32,
          fontSize: 30,
          opacity: 0.92,
          maxWidth: 800,
          lineHeight: 1.3,
          display: "flex",
        }}
      >
        Custom fashion. Connecting you with seamstresses, tailors, and designers
        anywhere.
      </div>
    </div>,
    { ...size }
  );
}
