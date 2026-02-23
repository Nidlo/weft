"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { MY_MEASUREMENTS } from "@/lib/graphql/queries/measurement";
import {
  CREATE_MEASUREMENT,
  UPDATE_MEASUREMENT,
  DELETE_MEASUREMENT,
  SET_DEFAULT_MEASUREMENT,
} from "@/lib/graphql/mutations/measurement";
import type {
  MyMeasurementsData,
  CreateMeasurementData,
  UpdateMeasurementData,
  DeleteMeasurementData,
  SetDefaultMeasurementData,
  CreateMeasurementInput,
  UpdateMeasurementInput,
} from "@/types/graphql";

export function useMeasurements() {
  const { data, loading, error, refetch } =
    useQuery<MyMeasurementsData>(MY_MEASUREMENTS);

  return {
    measurements: data?.myMeasurements ?? [],
    loading,
    error,
    refetch,
  };
}

export function useCreateMeasurement() {
  const [mutate, { loading, error }] = useMutation<CreateMeasurementData>(
    CREATE_MEASUREMENT,
    {
      refetchQueries: [{ query: MY_MEASUREMENTS }],
    }
  );

  const createMeasurement = async (input: CreateMeasurementInput) => {
    const result = await mutate({ variables: { input } });
    return result.data?.createMeasurement ?? null;
  };

  return { createMeasurement, loading, error };
}

export function useUpdateMeasurement() {
  const [mutate, { loading, error }] = useMutation<UpdateMeasurementData>(
    UPDATE_MEASUREMENT,
    {
      refetchQueries: [{ query: MY_MEASUREMENTS }],
    }
  );

  const updateMeasurement = async (id: string, input: UpdateMeasurementInput) => {
    const result = await mutate({ variables: { id, input } });
    return result.data?.updateMeasurement ?? null;
  };

  return { updateMeasurement, loading, error };
}

export function useDeleteMeasurement() {
  const [mutate, { loading, error }] = useMutation<DeleteMeasurementData>(
    DELETE_MEASUREMENT,
    {
      refetchQueries: [{ query: MY_MEASUREMENTS }],
    }
  );

  const deleteMeasurement = async (id: string) => {
    const result = await mutate({ variables: { id } });
    return result.data?.deleteMeasurement ?? false;
  };

  return { deleteMeasurement, loading, error };
}

export function useSetDefaultMeasurement() {
  const [mutate, { loading, error }] = useMutation<SetDefaultMeasurementData>(
    SET_DEFAULT_MEASUREMENT,
    {
      refetchQueries: [{ query: MY_MEASUREMENTS }],
    }
  );

  const setDefaultMeasurement = async (id: string) => {
    const result = await mutate({ variables: { id } });
    return result.data?.setDefaultMeasurement ?? null;
  };

  return { setDefaultMeasurement, loading, error };
}
