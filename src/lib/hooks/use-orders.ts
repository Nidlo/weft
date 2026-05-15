"use client";

import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import type { Reference } from "@apollo/client";
import {
  MY_ORDERS,
  GET_ORDER,
  ORDER_PROFIT_SUMMARY,
  SEARCH_CLIENTS,
  CLIENT_MEASUREMENTS,
} from "@/lib/graphql/queries/order";
import {
  CREATE_INTERNAL_ORDER,
  UPDATE_ORDER,
  CREATE_BLUEPRINT_OPTION,
  RESPOND_TO_ORDER,
  CONFIRM_ORDER,
  UPDATE_ORDER_STATUS,
  CANCEL_ORDER,
  CONFIRM_DELIVERY,
  ADD_ITEM,
  TOGGLE_PURCHASED,
  REMOVE_ITEM,
  SET_ORDER_GARMENT_EASE,
  CLEAR_ORDER_GARMENT_EASE,
} from "@/lib/graphql/mutations/order";
import type {
  MyOrdersData,
  OrderDetailData,
  OrderProfitSummaryData,
  RespondToOrderData,
  RespondToOrderInput,
  ConfirmOrderData,
  UpdateOrderStatusData,
  UpdateOrderStatusInput,
  CancelOrderData,
  ConfirmDeliveryData,
  AddItemData,
  AddItemInput,
  TogglePurchasedData,
  RemoveItemData,
  CreateInternalOrderData,
  CreateInternalOrderInput,
  UpdateOrderData,
  UpdateOrderInput,
  CreateBlueprintOptionData,
  ClientMeasurementsData,
  SearchClientsData,
  SetOrderGarmentEaseData,
  SetOrderGarmentEaseInput,
  ClearOrderGarmentEaseData,
} from "@/types/graphql";

export function useOrders(status?: string, first = 20, page = 1) {
  const { data, loading, error, refetch } = useQuery<MyOrdersData>(MY_ORDERS, {
    variables: { status, first, page },
    fetchPolicy: "cache-and-network",
  });

  return {
    orders: data?.myOrders.data ?? [],
    paginatorInfo: data?.myOrders.paginatorInfo ?? null,
    loading,
    error,
    refetch,
  };
}

export function useOrder(id: string) {
  const { data, loading, error, refetch } = useQuery<OrderDetailData>(
    GET_ORDER,
    {
      variables: { id },
      skip: !id,
    }
  );

  return {
    order: data?.order ?? null,
    loading,
    error,
    refetch,
  };
}

export function useOrderProfitSummary(orderId: string) {
  const { data, loading, error, refetch } = useQuery<OrderProfitSummaryData>(
    ORDER_PROFIT_SUMMARY,
    {
      variables: { orderId },
      skip: !orderId,
    }
  );

  return {
    summary: data?.orderProfitSummary ?? null,
    loading,
    error,
    refetch,
  };
}

export function useRespondToOrder() {
  const [mutate, { loading, error }] = useMutation<RespondToOrderData>(
    RESPOND_TO_ORDER,
    {
      refetchQueries: [{ query: MY_ORDERS }],
    }
  );

  const respondToOrder = async (input: RespondToOrderInput) => {
    const result = await mutate({ variables: { input } });
    return result.data?.respondToOrder ?? null;
  };

  return { respondToOrder, loading, error };
}

export function useConfirmOrder() {
  const [mutate, { loading, error }] = useMutation<ConfirmOrderData>(
    CONFIRM_ORDER,
    {
      refetchQueries: [{ query: MY_ORDERS }],
    }
  );

  const confirmOrder = async (orderId: string) => {
    const result = await mutate({ variables: { orderId } });
    return result.data?.confirmOrder ?? null;
  };

  return { confirmOrder, loading, error };
}

export function useUpdateOrderStatus() {
  const [mutate, { loading, error }] = useMutation<UpdateOrderStatusData>(
    UPDATE_ORDER_STATUS,
    {
      refetchQueries: [{ query: MY_ORDERS }],
    }
  );

  const updateOrderStatus = async (input: UpdateOrderStatusInput) => {
    const result = await mutate({ variables: { input } });
    return result.data?.updateOrderStatus ?? null;
  };

  return { updateOrderStatus, loading, error };
}

export function useCancelOrder() {
  const [mutate, { loading, error }] = useMutation<CancelOrderData>(
    CANCEL_ORDER,
    {
      refetchQueries: [{ query: MY_ORDERS }],
    }
  );

  const cancelOrder = async (orderId: string, reason?: string) => {
    const result = await mutate({ variables: { orderId, reason } });
    return result.data?.cancelOrder ?? null;
  };

  return { cancelOrder, loading, error };
}

export function useConfirmDelivery() {
  const [mutate, { loading, error }] = useMutation<ConfirmDeliveryData>(
    CONFIRM_DELIVERY,
    {
      refetchQueries: [{ query: MY_ORDERS }],
    }
  );

  const confirmDelivery = async (orderId: string) => {
    const result = await mutate({ variables: { orderId } });
    return result.data?.confirmDelivery ?? null;
  };

  return { confirmDelivery, loading, error };
}

/**
 * Apollo cache update for AddItem: appends the new item ref to the parent
 * order's `items` array so the cost-book panel re-renders without a
 * GET_ORDER refetch. Apollo already stores the item itself (the mutation
 * returns it with __typename + id); the array just needs the new ref.
 *
 * Also refetches `orderProfitSummary` because that summary is computed
 * server-side from the items list - Apollo can't recompute it from a
 * cache.modify, and the totals (totalItemCost, itemCount, purchasedCount)
 * would otherwise stay stale until the next GET_ORDER.
 */
export function useAddItem() {
  const [mutate, { loading, error }] = useMutation<AddItemData>(ADD_ITEM, {
    update(cache, { data }) {
      if (!data?.addItem) return;
      cache.modify({
        id: cache.identify({
          __typename: "OrderType",
          id: data.addItem.orderId,
        }),
        fields: {
          items(existing, { toReference }) {
            const list: readonly Reference[] = Array.isArray(existing)
              ? (existing as readonly Reference[])
              : [];
            const newRef = toReference({
              __typename: "OrderItemType",
              id: data.addItem.id,
            });
            return newRef ? [...list, newRef] : list;
          },
        },
      });
    },
  });

  const addItem = async (input: AddItemInput) => {
    const result = await mutate({
      variables: { input },
      refetchQueries: [
        { query: ORDER_PROFIT_SUMMARY, variables: { orderId: input.orderId } },
      ],
    });
    return result.data?.addItem ?? null;
  };

  return { addItem, loading, error };
}

/**
 * TogglePurchased relies on Apollo's automatic by-id merge for the item
 * itself - the mutation returns the updated row, Apollo writes it into the
 * entity store, every subscriber re-renders. BUT `orderProfitSummary` is
 * a separate query whose `purchasedCount` is computed server-side; Apollo
 * has no way to recompute it from the toggled item alone. Caller passes
 * `orderId` so we can refetch the summary; the call is cheap (single row
 * by id, no joins) and keeps the panel's "n/m purchased" line live.
 */
export function useTogglePurchased() {
  const [mutate, { loading, error }] =
    useMutation<TogglePurchasedData>(TOGGLE_PURCHASED);

  const togglePurchased = async (itemId: string, orderId?: string) => {
    const result = await mutate({
      variables: { itemId },
      refetchQueries: orderId
        ? [{ query: ORDER_PROFIT_SUMMARY, variables: { orderId } }]
        : [],
    });
    return result.data?.togglePurchased ?? null;
  };

  return { togglePurchased, loading, error };
}

/**
 * Apollo cache update for RemoveItem: filters the deleted item's ref out
 * of the parent order's `items` array, evicts the item entity from the
 * cache, and refetches the profit summary so totalItemCost / itemCount /
 * purchasedCount stay in sync.
 */
export function useRemoveItem() {
  const [mutate, { loading, error }] = useMutation<RemoveItemData>(REMOVE_ITEM);

  const removeItem = async (itemId: string, orderId: string) => {
    const result = await mutate({
      variables: { itemId },
      refetchQueries: [{ query: ORDER_PROFIT_SUMMARY, variables: { orderId } }],
      update(cache, response) {
        if (!response.data?.removeItem) return;
        cache.modify({
          id: cache.identify({ __typename: "OrderType", id: orderId }),
          fields: {
            items(existing, { readField }) {
              const list: readonly Reference[] = Array.isArray(existing)
                ? (existing as readonly Reference[])
                : [];
              return list.filter((ref) => readField("id", ref) !== itemId);
            },
          },
        });
        cache.evict({
          id: cache.identify({ __typename: "OrderItemType", id: itemId }),
        });
        cache.gc();
      },
    });
    return result.data?.removeItem ?? false;
  };

  return { removeItem, loading, error };
}

export function useSetOrderGarmentEase(orderId: string) {
  const [mutate, { loading, error }] = useMutation<SetOrderGarmentEaseData>(
    SET_ORDER_GARMENT_EASE,
    {
      refetchQueries: [{ query: GET_ORDER, variables: { id: orderId } }],
    }
  );

  const setOrderGarmentEase = async (input: SetOrderGarmentEaseInput) => {
    const result = await mutate({ variables: { input } });
    return result.data?.setOrderGarmentEase ?? null;
  };

  return { setOrderGarmentEase, loading, error };
}

export function useClearOrderGarmentEase(orderId: string) {
  const [mutate, { loading, error }] = useMutation<ClearOrderGarmentEaseData>(
    CLEAR_ORDER_GARMENT_EASE,
    {
      refetchQueries: [{ query: GET_ORDER, variables: { id: orderId } }],
    }
  );

  const clearOrderGarmentEase = async (section: string, field: string) => {
    const result = await mutate({
      variables: { orderId, section, field },
    });
    return result.data?.clearOrderGarmentEase ?? false;
  };

  return { clearOrderGarmentEase, loading, error };
}

export function useCreateInternalOrder() {
  const [mutate, { loading, error }] = useMutation<CreateInternalOrderData>(
    CREATE_INTERNAL_ORDER,
    { refetchQueries: [{ query: MY_ORDERS }] }
  );

  const createInternalOrder = async (input: CreateInternalOrderInput) => {
    const result = await mutate({ variables: { input } });
    return result.data?.createInternalOrder ?? null;
  };

  return { createInternalOrder, loading, error };
}

export function useUpdateOrder() {
  const [mutate, { loading, error }] = useMutation<UpdateOrderData>(
    UPDATE_ORDER,
    {
      refetchQueries: [{ query: MY_ORDERS }],
    }
  );

  const updateOrder = async (input: UpdateOrderInput) => {
    const result = await mutate({ variables: { input } });
    return result.data?.updateOrder ?? null;
  };

  return { updateOrder, loading, error };
}

export function useCreateBlueprintOption() {
  const [mutate, { loading, error }] = useMutation<CreateBlueprintOptionData>(
    CREATE_BLUEPRINT_OPTION
  );

  const createBlueprintOption = async (
    category: string,
    value: string,
    label: string
  ) => {
    const result = await mutate({ variables: { category, value, label } });
    return result.data?.createBlueprintOption ?? null;
  };

  return { createBlueprintOption, loading, error };
}

export function useClientMeasurements(clientId: string | null) {
  const { data, loading, error, refetch } = useQuery<ClientMeasurementsData>(
    CLIENT_MEASUREMENTS,
    {
      variables: { clientId },
      skip: !clientId,
      fetchPolicy: "cache-and-network",
    }
  );

  return {
    measurements: data?.clientMeasurements ?? [],
    loading,
    error,
    refetch,
  };
}

export function useSearchClients() {
  const [search, { data, loading }] = useLazyQuery<SearchClientsData>(
    SEARCH_CLIENTS,
    { fetchPolicy: "network-only" }
  );

  const searchClients = (query: string) => {
    if (query.length >= 2) {
      search({ variables: { query, first: 10 } });
    }
  };

  return {
    searchClients,
    results: data?.searchClients ?? [],
    loading,
  };
}
