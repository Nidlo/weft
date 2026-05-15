import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: "/offline",
  },
});

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
    // Auto-rewrite `import { Foo } from "<lib>"` into deep imports so we
    // don't ship the full barrel. Big win for libs with many named exports
    // — lucide alone has hundreds.
    optimizePackageImports: ["lucide-react", "motion", "date-fns"],
  },
};

export default withPWA(nextConfig);
