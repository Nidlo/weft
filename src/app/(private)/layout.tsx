import type { Metadata } from "next";

/**
 * Layout for every authenticated, account-scoped surface. Sets
 * `robots: noindex, nofollow` so that even if a crawler ignores
 * `robots.txt`, the response itself tells it not to index. Sharing
 * URLs from these pages falls back to the root Nidlo share card
 * defined in `src/app/layout.tsx`, which deliberately leaks no
 * personal info.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
