import type { Metadata } from "next";

import { SearchClient } from "./search-client";

const SEARCH_DESCRIPTION =
  "Find a custom-fashion designer, tailor or seamstress on Nidlo. Filter by specialization, city, price and rating, then send your commission with a few taps.";

export const metadata: Metadata = {
  title: "Find a designer",
  description: SEARCH_DESCRIPTION,
  alternates: {
    canonical: "/search",
  },
  openGraph: {
    type: "website",
    title: "Find a designer on Nidlo",
    description: SEARCH_DESCRIPTION,
    url: "/search",
    siteName: "Nidlo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find a designer on Nidlo",
    description: SEARCH_DESCRIPTION,
  },
};

export default function SearchPage() {
  return <SearchClient />;
}
