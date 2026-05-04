import { ImageResponse } from "next/og";
import { parseStringList } from "@/lib/utils/parse-list";

export const runtime = "edge";
export const alt = "Nidlo designer profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SLUG_RE = /^[a-z0-9-]+$/;

interface DesignerOg {
  fullName: string | null;
  designerProfile: {
    displayName: string | null;
    specializations: unknown;
    portfolioImages: unknown;
    ratingAvg: number;
    totalReviews: number;
    city: string | null;
  } | null;
  city: string | null;
}

async function fetchDesigner(slug: string): Promise<DesignerOg | null> {
  if (!SLUG_RE.test(slug)) return null;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `
          query GetDesignerOg($slug: String!) {
            designer(slug: $slug) {
              fullName
              city
              designerProfile {
                displayName
                specializations
                portfolioImages
                ratingAvg
                totalReviews
              }
            }
          }
        `,
        variables: { slug },
      }),
      next: { revalidate: 600 },
    });
    const json = await res.json();
    return (json?.data?.designer as DesignerOg | null) ?? null;
  } catch {
    return null;
  }
}


function getPortfolioBackground(raw: unknown): string | null {
  const items = parseStringList(raw) as Array<string | { url?: string }>;
  if (items.length === 0) return null;
  const first = items[0];
  const url = typeof first === "string" ? first : first?.url;
  if (!url || typeof url !== "string") return null;
  if (url.includes("ik.imagekit.io")) {
    const endpoint =
      process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? "https://ik.imagekit.io/snad";
    const path = url.replace(endpoint, "").replace(/^\/tr:[^/]*/, "");
    const slash = path.startsWith("/") ? "" : "/";
    return `${endpoint}/tr:w-1200,h-630,c-maintain_ratio,fo-auto${slash}${path}`;
  }
  return url;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function OgImage({ params }: Props) {
  const { slug } = await params;
  const designer = await fetchDesigner(slug);

  const profile = designer?.designerProfile;
  const displayName =
    profile?.displayName ?? designer?.fullName ?? "Nidlo Designer";
  const specs = parseStringList(profile?.specializations).slice(0, 3);
  const ratingAvg = profile?.ratingAvg ?? 0;
  const totalReviews = profile?.totalReviews ?? 0;
  const city = designer?.city ?? null;
  const background = getPortfolioBackground(profile?.portfolioImages);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 64,
          backgroundColor: "#0b0b0c",
          backgroundImage: background ? `url(${background})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Dark overlay for legibility */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.15) 100%)",
            display: "flex",
          }}
        />

        {/* Brand mark — top left */}
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 64,
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: 2,
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          NIDLO
        </div>

        {/* Content */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column" }}>
          {specs.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 12,
                marginBottom: 20,
                flexWrap: "wrap",
              }}
            >
              {specs.map((s) => (
                <div
                  key={s}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 999,
                    backgroundColor: "rgba(255,255,255,0.18)",
                    fontSize: 22,
                    display: "flex",
                  }}
                >
                  {s.replace(/-/g, " ")}
                </div>
              ))}
            </div>
          )}
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.05,
              display: "flex",
            }}
          >
            {displayName}
          </div>
          <div
            style={{
              marginTop: 18,
              display: "flex",
              alignItems: "center",
              gap: 24,
              fontSize: 28,
              opacity: 0.92,
            }}
          >
            {ratingAvg > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#ffc94d" }}>★</span>
                <span>{ratingAvg.toFixed(1)}</span>
                <span style={{ opacity: 0.7 }}>({totalReviews})</span>
              </div>
            )}
            {city && <div style={{ display: "flex" }}>{city}</div>}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
