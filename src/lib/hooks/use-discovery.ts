"use client";

import { SEARCH_DESIGNERS } from "@/lib/graphql/queries/designer";
import { useCancelableQuery } from "@/lib/hooks/use-cancelable-query";
import type { DesignersData } from "@/types/graphql";

const DISCOVERY_LIMIT = 10;

// Discovery hooks back the home page's "top rated", "new", "near you" rails.
// Three deliberate calls:
//  - `cache-first` so a return visit to / doesn't fire 3 fresh searches that
//    queue against the next-page navigation (HTTP/1.1 caps the per-origin
//    pool at 6 sockets — top + new + nearby alone can starve it);
//  - `useCancelableQuery` so if the user clicks "Get started" mid-fetch on
//    the first visit, the still-in-flight search is aborted and the country
//    picker on /auth/phone gets its slot back immediately.

export function useTopRated() {
  const { data, loading } = useCancelableQuery<DesignersData>(
    SEARCH_DESIGNERS,
    {
      variables: {
        input: { sortBy: "rating", acceptingOnly: true },
        first: DISCOVERY_LIMIT,
      },
      fetchPolicy: "cache-first",
    }
  );

  return { designers: data?.designers?.data ?? [], loading };
}

export function useNewDesigners() {
  const { data, loading } = useCancelableQuery<DesignersData>(
    SEARCH_DESIGNERS,
    {
      variables: {
        input: { sortBy: "newest", acceptingOnly: true },
        first: DISCOVERY_LIMIT,
      },
      fetchPolicy: "cache-first",
    }
  );

  return { designers: data?.designers?.data ?? [], loading };
}

export function useNearbyDesigners(lat: number | null, lng: number | null) {
  const { data, loading } = useCancelableQuery<DesignersData>(
    SEARCH_DESIGNERS,
    {
      variables: {
        input: { sortBy: "distance", lat, lng, acceptingOnly: true },
        first: DISCOVERY_LIMIT,
      },
      skip: lat === null || lng === null,
      fetchPolicy: "cache-first",
    }
  );

  return { designers: data?.designers?.data ?? [], loading };
}
