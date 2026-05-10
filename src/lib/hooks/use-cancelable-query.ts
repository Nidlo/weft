"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client/react";
import type {
  DocumentNode,
  OperationVariables,
  TypedDocumentNode,
} from "@apollo/client";

// Apollo v4's `useQuery` second-arg is `Options | SkipToken | undefined`
// where SkipToken is a unique symbol. We only thread real options here.
type Options<TData, TVariables extends OperationVariables> = Exclude<
  Parameters<typeof useQuery<TData, TVariables>>[1],
  symbol | undefined
>;

/**
 * Drop-in replacement for Apollo's `useQuery` that aborts the in-flight
 * fetch when the component unmounts. Without this the request keeps
 * holding a slot in the browser's per-origin connection pool (capped at
 * 6 over HTTP/1.1), and any query the next page fires waits in the
 * queue. That's the root cause of the "click 'Get started' and the
 * country picker takes 30s to render" pain on the home → /auth/phone
 * navigation.
 *
 * The signal is threaded into Apollo's per-op `context.fetchOptions.signal`,
 * which `apollo-upload-client/UploadHttpLink` forwards to the underlying
 * `fetch` (verified in vendor source).
 */
export function useCancelableQuery<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: Options<TData, TVariables>
) {
  // Lazy state initializer — useRef would also work but reading
  // ref.current during render trips react-hooks/refs. State stays
  // referentially stable across renders.
  const [controller] = useState(() => new AbortController());

  useEffect(
    () => () => {
      controller.abort();
    },
    [controller]
  );

  const userContext = (options?.context ?? {}) as {
    fetchOptions?: RequestInit;
    [key: string]: unknown;
  };
  const userFetchOptions = userContext.fetchOptions ?? {};

  const merged = {
    ...options,
    context: {
      ...userContext,
      fetchOptions: {
        ...userFetchOptions,
        signal: controller.signal,
      },
    },
  } as unknown as Options<TData, TVariables>;

  return useQuery<TData, TVariables>(query, merged);
}
