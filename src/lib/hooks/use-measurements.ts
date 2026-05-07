"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  MY_MEASUREMENTS,
  MEASUREMENT_HISTORY,
} from "@/lib/graphql/queries/measurement";
import {
  CREATE_MEASUREMENT,
  UPDATE_MEASUREMENT,
  DELETE_MEASUREMENT,
  SET_DEFAULT_MEASUREMENT,
  RESET_MEASUREMENT_FIELD,
  APPLY_MEASUREMENT_RESCAN,
} from "@/lib/graphql/mutations/measurement";
import type {
  MyMeasurementsData,
  CreateMeasurementData,
  UpdateMeasurementData,
  DeleteMeasurementData,
  SetDefaultMeasurementData,
  ResetMeasurementFieldData,
  CreateMeasurementInput,
  UpdateMeasurementInput,
  MeasurementHistoryData,
  ApplyRescanData,
  ApplyRescanInput,
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

export function useResetMeasurementField() {
  const [mutate, { loading, error }] = useMutation<ResetMeasurementFieldData>(
    RESET_MEASUREMENT_FIELD,
    {
      refetchQueries: [{ query: MY_MEASUREMENTS }],
    },
  );

  const resetMeasurementField = async (
    id: string,
    section: string,
    field: string,
  ) => {
    const result = await mutate({ variables: { id, section, field } });
    return result.data?.resetMeasurementField ?? null;
  };

  return { resetMeasurementField, loading, error };
}

export function useMeasurementHistory(measurementId: string | null) {
  const { data, loading, error, refetch } = useQuery<MeasurementHistoryData>(
    MEASUREMENT_HISTORY,
    {
      variables: { measurementId: measurementId ?? "" },
      skip: !measurementId,
    },
  );

  return {
    history: data?.measurementHistory ?? [],
    loading,
    error,
    refetch,
  };
}

export function useApplyMeasurementRescan() {
  const [mutate, { loading, error }] = useMutation<ApplyRescanData>(
    APPLY_MEASUREMENT_RESCAN,
    {
      refetchQueries: [{ query: MY_MEASUREMENTS }],
    },
  );

  const applyRescan = async (id: string, input: ApplyRescanInput) => {
    const result = await mutate({ variables: { id, input } });
    return result.data?.applyMeasurementRescan ?? null;
  };

  return { applyRescan, loading, error };
}
