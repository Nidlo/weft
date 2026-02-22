"use client";

import { useQuery } from "@apollo/client/react";
import { SEARCH_DESIGNERS } from "@/lib/graphql/queries/designer";
import type { DesignersData, SearchDesignersInput } from "@/types/graphql";

const PAGE_SIZE = 20;

export function useDesignerSearch(input?: SearchDesignersInput) {
  const { data, loading, error, fetchMore } = useQuery<DesignersData>(
    SEARCH_DESIGNERS,
    {
      variables: { input, first: PAGE_SIZE },
      notifyOnNetworkStatusChange: true,
    }
  );

  const designers = data?.designers.data ?? [];
  const paginatorInfo = data?.designers.paginatorInfo;

  const loadMore = async () => {
    if (!paginatorInfo?.hasMorePages || !paginatorInfo.endCursor) return;

    await fetchMore({
      variables: {
        input,
        first: PAGE_SIZE,
        after: paginatorInfo.endCursor,
      },
    });
  };

  return {
    designers,
    loading,
    error,
    hasMore: paginatorInfo?.hasMorePages ?? false,
    loadMore,
  };
}
