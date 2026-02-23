"use client";

import { useQuery } from "@apollo/client/react";
import { GET_BLUEPRINT_OPTIONS } from "@/lib/graphql/queries/blueprint";
import type { BlueprintOptionsData } from "@/types/graphql";

export function useBlueprintOptions() {
  const { data, loading, error } = useQuery<BlueprintOptionsData>(
    GET_BLUEPRINT_OPTIONS
  );

  return {
    options: data?.blueprintOptions ?? null,
    loading,
    error,
  };
}
