"use client";

import { useMutation } from "@apollo/client/react";
import {
  UPDATE_PROFILE,
  UPDATE_AVATAR,
  ADD_PORTFOLIO_IMAGE,
  REMOVE_PORTFOLIO_IMAGE,
  REORDER_PORTFOLIO_IMAGES,
} from "@/lib/graphql/mutations/profile";
import { ME_QUERY } from "@/lib/graphql/queries/auth";
import type {
  UpdateProfileData,
  UpdateProfileInput,
  UpdateAvatarData,
  AddPortfolioImageData,
  RemovePortfolioImageData,
  ReorderPortfolioImagesData,
} from "@/types/graphql";

export function useUpdateProfile() {
  const [mutate, { loading, error }] = useMutation<UpdateProfileData>(
    UPDATE_PROFILE,
    { refetchQueries: [{ query: ME_QUERY }] }
  );

  const updateProfile = async (input: UpdateProfileInput) => {
    const { data } = await mutate({ variables: { input } });
    return data?.updateProfile;
  };

  return { updateProfile, loading, error };
}

export function useUpdateAvatar() {
  const [mutate, { loading, error }] = useMutation<UpdateAvatarData>(
    UPDATE_AVATAR,
    { refetchQueries: [{ query: ME_QUERY }] }
  );

  const updateAvatar = async (file: File) => {
    const { data } = await mutate({ variables: { file } });
    return data?.updateAvatar;
  };

  return { updateAvatar, loading, error };
}

export function useAddPortfolioImage() {
  const [mutate, { loading, error }] = useMutation<AddPortfolioImageData>(
    ADD_PORTFOLIO_IMAGE
  );

  const addImage = async (file: File, caption?: string) => {
    const { data } = await mutate({ variables: { file, caption } });
    return data?.addPortfolioImage;
  };

  return { addImage, loading, error };
}

export function useRemovePortfolioImage() {
  const [mutate, { loading, error }] = useMutation<RemovePortfolioImageData>(
    REMOVE_PORTFOLIO_IMAGE
  );

  const removeImage = async (index: number) => {
    const { data } = await mutate({ variables: { index } });
    return data?.removePortfolioImage;
  };

  return { removeImage, loading, error };
}

export function useReorderPortfolioImages() {
  const [mutate, { loading, error }] =
    useMutation<ReorderPortfolioImagesData>(REORDER_PORTFOLIO_IMAGES);

  const reorderImages = async (order: number[]) => {
    const { data } = await mutate({ variables: { order } });
    return data?.reorderPortfolioImages;
  };

  return { reorderImages, loading, error };
}
