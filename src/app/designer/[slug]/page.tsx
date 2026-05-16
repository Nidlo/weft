import { notFound } from "next/navigation";
import { DesignerProfileView } from "./designer-profile-view";
import { DesignerJsonLd } from "@/components/seo/designer-json-ld";
import { ssrGraphQL, GraphQLTransportError } from "@/lib/graphql/ssr-fetch";

interface Props {
  params: Promise<{ slug: string }>;
}

// Matches both a pretty slug (kebab-case) and a lowercase UUID
// (hex + hyphens) so a shared link resolves either way. Anything with
// uppercase, slashes, dots, etc. is rejected before we spend an API call.
const SLUG_RE = /^[a-z0-9-]+$/;

const GET_DESIGNER_SSR = `
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
        workshopName
        workshopAddress
        workshopLat
        workshopLng
        profileCompleteness
        publicVisibility
      }
    }
  }
`;

type DesignerPayload = {
  designer: Parameters<typeof DesignerProfileView>[0]["designer"] | null;
};

/**
 * Resolve a designer for SSR.
 *
 * Returns `null` ONLY when the record genuinely doesn't exist (bad slug
 * shape, or the backend says `designer: null`) - that's a real 404.
 * THROWS GraphQLTransportError when the backend is unreachable / errors;
 * the caller must let that propagate to an error boundary rather than
 * masquerade as "not found" (the old bug: a self-signed-cert SSR fetch
 * failure rendered "Designer Not Found" for designers that exist).
 */
async function fetchDesigner(slug: string) {
  if (!SLUG_RE.test(slug)) return null;

  const data = await ssrGraphQL<DesignerPayload>(GET_DESIGNER_SSR, { slug });
  return data.designer ?? null;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;

  // Metadata generation must never hard-crash the route. On a transport
  // failure, degrade to a neutral title (the page component below still
  // surfaces the real error). Only a genuine null = "not found".
  let designer: Awaited<ReturnType<typeof fetchDesigner>> = null;
  try {
    designer = await fetchDesigner(slug);
  } catch (err) {
    if (err instanceof GraphQLTransportError) {
      return { title: "Nidlo Designer" };
    }
    throw err;
  }

  if (!designer) {
    return { title: "Designer Not Found - Nidlo" };
  }

  const profile = designer.designerProfile;
  const displayName = profile?.displayName ?? designer.fullName ?? "Designer";

  // Build description with specializations
  let specs: string[] = [];
  const rawSpecs = profile?.specializations;
  if (Array.isArray(rawSpecs)) specs = rawSpecs;
  else if (typeof rawSpecs === "string") {
    try {
      specs = JSON.parse(rawSpecs);
    } catch {
      /* ignore */
    }
  }
  const specsText = specs
    .slice(0, 3)
    .map((s: string) => s.replace(/-/g, " "))
    .join(", ");

  const description = profile?.bio
    ? profile.bio.slice(0, 160)
    : specsText
      ? `${displayName} specializes in ${specsText}. Book custom fashion on Nidlo.`
      : `${displayName} is a fashion designer on Nidlo. View portfolio and request a quote.`;

  const url = `/designer/${slug}`;

  // openGraph.images / twitter.images are auto-populated by the
  // [opengraph-image](./opengraph-image.tsx) file convention.
  return {
    title: `${displayName} - Nidlo Designer`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "profile" as const,
      title: `${displayName} - Nidlo`,
      description,
      url,
      siteName: "Nidlo",
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${displayName} - Nidlo`,
      description,
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
