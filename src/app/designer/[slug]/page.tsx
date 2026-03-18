import { notFound } from "next/navigation";
import { DesignerProfileView } from "./designer-profile-view";
import { DesignerJsonLd } from "@/components/seo/designer-json-ld";

interface Props {
  params: Promise<{ slug: string }>;
}

async function fetchDesigner(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        query: `
          query GetDesigner($slug: String!) {
            designer(slug: $slug) {
              id
              firstName
              lastName
              fullName
              avatarUrl
              city
              countryCode
              isVerified
              isDesigner
              isOnboarded
              designerProfile {
                id
                displayName
                slug
                bio
                specializations
                pricingMin
                pricingMax
                portfolioImages
                equipment
                ratingAvg
                totalReviews
                ordersCompleted
                onTimeRate
                responseTimeAvg
                isAcceptingOrders
                profileCompleteness
              }
            }
          }
        `,
        variables: { slug },
      }),
      next: { revalidate: 60 },
    });

    const json = await res.json();
    return json?.data?.designer ?? null;
  } catch {
    return null;
  }
}

function getOgImage(designer: Record<string, unknown>): string | null {
  const profile = designer.designerProfile as Record<string, unknown> | null;
  const IMAGEKIT_ENDPOINT =
    process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? "https://ik.imagekit.io/snad";

  // Try first portfolio image
  let images: Array<{ url: string }> = [];
  const raw = profile?.portfolioImages;
  if (Array.isArray(raw)) images = raw;
  else if (typeof raw === "string") {
    try { images = JSON.parse(raw); } catch { /* ignore */ }
  }

  const sourceUrl = images[0]?.url ?? (designer.avatarUrl as string | null);
  if (!sourceUrl) return null;

  // Apply ImageKit 1200x630 transform for OG
  if (sourceUrl.includes("ik.imagekit.io")) {
    const path = sourceUrl.replace(IMAGEKIT_ENDPOINT, "");
    return `${IMAGEKIT_ENDPOINT}/tr:w-1200,h-630,c-maintain_ratio,fo-auto${path}`;
  }

  return sourceUrl;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const designer = await fetchDesigner(slug);

  if (!designer) {
    return { title: "Designer Not Found - StitchHub" };
  }

  const profile = designer.designerProfile;
  const displayName = profile?.displayName ?? designer.fullName ?? "Designer";

  // Build description with specializations
  let specs: string[] = [];
  const rawSpecs = profile?.specializations;
  if (Array.isArray(rawSpecs)) specs = rawSpecs;
  else if (typeof rawSpecs === "string") {
    try { specs = JSON.parse(rawSpecs); } catch { /* ignore */ }
  }
  const specsText = specs.slice(0, 3).map((s: string) => s.replace(/-/g, " ")).join(", ");

  const description = profile?.bio
    ? profile.bio.slice(0, 160)
    : specsText
      ? `${displayName} specializes in ${specsText}. Book custom fashion on StitchHub.`
      : `${displayName} is a fashion designer on StitchHub. View portfolio and request a quote.`;

  const ogImage = getOgImage(designer);
  const url = `/designer/${slug}`;

  return {
    title: `${displayName} - StitchHub Designer`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "profile" as const,
      title: `${displayName} - StitchHub`,
      description,
      url,
      siteName: "StitchHub",
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: displayName }] : [],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${displayName} - StitchHub`,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function DesignerProfilePage({ params }: Props) {
  const { slug } = await params;
  const designer = await fetchDesigner(slug);

  if (!designer) {
    notFound();
  }

  return (
    <>
      <DesignerJsonLd designer={designer} />
      <DesignerProfileView designer={designer} />
    </>
  );
}
