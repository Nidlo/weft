import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://stitchhub.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface SlugEntry {
  slug: string;
  updatedAt: string;
}

async function fetchDesignerSlugs(): Promise<SlugEntry[]> {
  if (!API_URL) return [];

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query { designerSlugs { slug updatedAt } }`,
      }),
      next: { revalidate: 3600 },
    });

    const json = await res.json();
    return json?.data?.designerSlugs ?? [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await fetchDesignerSlugs();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${APP_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/auth/phone`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const designerPages: MetadataRoute.Sitemap = slugs.map((entry) => ({
    url: `${APP_URL}/designer/${entry.slug}`,
    lastModified: new Date(entry.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...designerPages];
}
