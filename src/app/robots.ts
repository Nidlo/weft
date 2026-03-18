import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://stitchhub.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/orders",
          "/messages",
          "/profile",
          "/wallet",
          "/notifications",
          "/auth/verify",
          "/auth/role",
          "/onboarding",
          "/blueprint",
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
