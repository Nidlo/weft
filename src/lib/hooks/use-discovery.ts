"use client";

import { useQuery } from "@apollo/client/react";
import { SEARCH_DESIGNERS } from "@/lib/graphql/queries/designer";
import type { DesignersData } from "@/types/graphql";

const DISCOVERY_LIMIT = 10;

export function useTopRated() {
  const { data, loading } = useQuery<DesignersData>(SEARCH_DESIGNERS, {
    variables: {
      input: { sortBy: "rating", acceptingOnly: true },
      first: DISCOVERY_LIMIT,
    },
  });

  return { designers: data?.designers.data ?? [], loading };
}

export function useNewDesigners() {
  const { data, loading } = useQuery<DesignersData>(SEARCH_DESIGNERS, {
    variables: {
      input: { sortBy: "newest", acceptingOnly: true },
      first: DISCOVERY_LIMIT,
    },
  });

  return { designers: data?.designers.data ?? [], loading };
}

export function useNearbyDesigners(lat: number | null, lng: number | null) {
  const { data, loading } = useQuery<DesignersData>(SEARCH_DESIGNERS, {
    variables: {
      input: { sortBy: "distance", lat, lng, acceptingOnly: true },
      first: DISCOVERY_LIMIT,
    },
    skip: lat === null || lng === null,
  });

  return { designers: data?.designers.data ?? [], loading };
}
