import type { GqlUserWithProfile } from "@/types/graphql";

interface Props {
  designer: GqlUserWithProfile;
}

function parseSpecs(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  return [];
}

function formatPrice(pesewas: number): string {
  return (pesewas / 100).toFixed(2);
}

export function DesignerJsonLd({ designer }: Props) {
  const profile = designer.designerProfile;
  const displayName =
    profile?.displayName ?? designer.fullName ?? "Designer";
  const specs = parseSpecs(profile?.specializations);
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://stitchhub.com";

  const priceRange =
    profile?.pricingMin != null && profile?.pricingMax != null
      ? `GHS ${formatPrice(profile.pricingMin)} - GHS ${formatPrice(profile.pricingMax)}`
      : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: displayName,
    description:
      profile?.bio ??
      (specs.length > 0
        ? `${displayName} specializes in ${specs.slice(0, 3).join(", ")}`
        : `Fashion designer on StitchHub`),
    url: `${appUrl}/designer/${profile?.slug ?? ""}`,
    ...(designer.avatarUrl ? { image: designer.avatarUrl } : {}),
    ...(designer.city
      ? { address: { "@type": "PostalAddress", addressLocality: designer.city } }
      : {}),
    ...(designer.countryCode
      ? { areaServed: { "@type": "Country", name: designer.countryCode } }
      : {}),
    ...(priceRange ? { priceRange } : {}),
    ...((profile?.ratingAvg ?? 0) > 0 && (profile?.totalReviews ?? 0) > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: profile!.ratingAvg,
            reviewCount: profile!.totalReviews,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
