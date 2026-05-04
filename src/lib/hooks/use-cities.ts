"use client";

import { useQuery } from "@apollo/client/react";
import { GET_CITIES } from "@/lib/graphql/queries/designer";
import type { CitiesData } from "@/types/graphql";

export function useCities(countryCode?: string) {
  const { data, loading, error } = useQuery<CitiesData>(GET_CITIES, {
    variables: { countryCode },
    fetchPolicy: "cache-first",
  });

  return {
    cities: data?.cities ?? [],
    loading,
    error,
  };
}
