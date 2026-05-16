"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  MY_BLUEPRINT_DRAFTS,
  BLUEPRINT_DRAFT_DETAIL,
} from "@/lib/graphql/queries/blueprint-draft";
import {
  CREATE_BLUEPRINT_DRAFT,
  REVISE_BLUEPRINT_DRAFT,
  ACCEPT_BLUEPRINT_DRAFT,
  CONVERT_BLUEPRINT_DRAFT_TO_ORDER,
  CLOSE_BLUEPRINT_DRAFT,
} from "@/lib/graphql/mutations/blueprint-draft";
import type {
  MyBlueprintDraftsData,
  BlueprintDraftDetailData,
  CreateBlueprintDraftData,
  CreateBlueprintDraftInput,
  ReviseBlueprintDraftData,
  ReviseBlueprintDraftInput,
  AcceptBlueprintDraftData,
  ConvertBlueprintDraftToOrderData,
  CloseBlueprintDraftData,
} from "@/types/graphql";

export function useBlueprintDrafts(status?: string) {
  const { data, loading, error, refetch } = useQuery<MyBlueprintDraftsData>(
    MY_BLUEPRINT_DRAFTS,
    {
      variables: { status },
      fetchPolicy: "cache-and-network",
    }
  );

  return {
    drafts: data?.myBlueprintDrafts ?? [],
    loading,
    error,
    refetch,
  };
}

export function useBlueprintDraft(id: string) {
  const { data, loading, error, refetch } = useQuery<BlueprintDraftDetailData>(
    BLUEPRINT_DRAFT_DETAIL,
    {
      variables: { id },
      skip: !id,
      fetchPolicy: "cache-and-network",
    }
  );

  return {
    draft: data?.blueprintDraft ?? null,
    loading,
    error,
    refetch,
  };
}

export function useCreateBlueprintDraft() {
  const [mutate, { loading, error }] = useMutation<CreateBlueprintDraftData>(
    CREATE_BLUEPRINT_DRAFT,
    { refetchQueries: [{ query: MY_BLUEPRINT_DRAFTS }] }
  );

  const createBlueprintDraft = async (input: CreateBlueprintDraftInput) => {
    const result = await mutate({ variables: { input } });
    return result.data?.createBlueprintDraft ?? null;
  };

  return { createBlueprintDraft, loading, error };
}

export function useReviseBlueprintDraft() {
  const [mutate, { loading, error }] = useMutation<ReviseBlueprintDraftData>(
    REVISE_BLUEPRINT_DRAFT
  );

  const reviseBlueprintDraft = async (input: ReviseBlueprintDraftInput) => {
    const result = await mutate({
      variables: { input },
      refetchQueries: [
        { query: BLUEPRINT_DRAFT_DETAIL, variables: { id: input.draftId } },
      ],
    });
    return result.data?.reviseBlueprintDraft ?? null;
  };

  return { reviseBlueprintDraft, loading, error };
}

export function useAcceptBlueprintDraft() {
  const [mutate, { loading, error }] = useMutation<AcceptBlueprintDraftData>(
    ACCEPT_BLUEPRINT_DRAFT
  );

  const acceptBlueprintDraft = async (draftId: string) => {
    const result = await mutate({
      variables: { draftId },
      refetchQueries: [
        { query: BLUEPRINT_DRAFT_DETAIL, variables: { id: draftId } },
        { query: MY_BLUEPRINT_DRAFTS },
      ],
    });
    return result.data?.acceptBlueprintDraft ?? null;
  };

  return { acceptBlueprintDraft, loading, error };
}

export function useConvertBlueprintDraft() {
  const [mutate, { loading, error }] =
    useMutation<ConvertBlueprintDraftToOrderData>(
      CONVERT_BLUEPRINT_DRAFT_TO_ORDER,
      { refetchQueries: [{ query: MY_BLUEPRINT_DRAFTS }] }
    );

  const convertBlueprintDraft = async (draftId: string) => {
    const result = await mutate({ variables: { draftId } });
    return result.data?.convertBlueprintDraftToOrder ?? null;
  };

  return { convertBlueprintDraft, loading, error };
}

export function useCloseBlueprintDraft() {
  const [mutate, { loading, error }] = useMutation<CloseBlueprintDraftData>(
    CLOSE_BLUEPRINT_DRAFT,
    { refetchQueries: [{ query: MY_BLUEPRINT_DRAFTS }] }
  );

  const closeBlueprintDraft = async (
    draftId: string,
    action: "withdraw" | "decline"
  ) => {
    const result = await mutate({ variables: { draftId, action } });
    return result.data?.closeBlueprintDraft ?? null;
  };

  return { closeBlueprintDraft, loading, error };
}
