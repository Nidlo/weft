import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/config";

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
          "/earnings",
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
