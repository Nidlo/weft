import type { GqlUserWithProfile } from "@/types/graphql";
import { APP_URL } from "@/lib/config";
import { safeJsonForScript } from "@/lib/utils/safe-json";
import { parseStringList } from "@/lib/utils/parse-list";
import { pesewasToGhs } from "@/lib/utils/order";

interface Props {
  designer: GqlUserWithProfile;
}

export function DesignerJsonLd({ designer }: Props) {
  const profile = designer.designerProfile;
  const displayName =
    profile?.displayName ?? designer.fullName ?? "Designer";
  const specs = parseStringList(profile?.specializations);
  const appUrl = APP_URL;

  const priceRange =
    profile?.pricingMin != null && profile?.pricingMax != null
      ? `GHS ${pesewasToGhs(profile.pricingMin)} - GHS ${pesewasToGhs(profile.pricingMax)}`
      : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: displayName,
    description:
      profile?.bio ??
      (specs.length > 0
        ? `${displayName} specializes in ${specs.slice(0, 3).join(", ")}`
        : `Fashion designer on Nidlo`),
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
      dangerouslySetInnerHTML={{ __html: safeJsonForScript(jsonLd) }}
    />
  );
}
