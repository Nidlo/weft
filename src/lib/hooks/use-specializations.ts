"use client";

import { useQuery } from "@apollo/client/react";
import { GET_SPECIALIZATIONS } from "@/lib/graphql/queries/designer";
import type { SpecializationsData } from "@/types/graphql";

export function useSpecializations() {
  const { data, loading, error } = useQuery<SpecializationsData>(
    GET_SPECIALIZATIONS,
    { fetchPolicy: "cache-first" }
  );

  const specializations = data?.specializations ?? [];
  const quickFilters = specializations.filter((s) => s.isQuickFilter);

  return {
    specializations,
    quickFilters,
    loading,
    error,
  };
}
