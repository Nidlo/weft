import { notFound } from "next/navigation";
import { DesignerProfileView } from "./designer-profile-view";

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

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const designer = await fetchDesigner(slug);

  if (!designer) {
    return { title: "Designer Not Found - StitchHub" };
  }

  const displayName = designer.designerProfile?.displayName ?? designer.fullName ?? "Designer";
  const description = designer.designerProfile?.bio
    ? designer.designerProfile.bio.slice(0, 160)
    : `${displayName} is a fashion designer on StitchHub.`;

  return {
    title: `${displayName} - StitchHub Designer`,
    description,
    openGraph: {
      title: `${displayName} - StitchHub`,
      description,
      images: designer.avatarUrl ? [{ url: designer.avatarUrl }] : [],
    },
  };
}

export default async function DesignerProfilePage({ params }: Props) {
  const { slug } = await params;
  const designer = await fetchDesigner(slug);

  if (!designer) {
    notFound();
  }

  return <DesignerProfileView designer={designer} />;
}
