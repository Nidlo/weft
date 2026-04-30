import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
} from "@apollo/client/core";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { ErrorLink } from "@apollo/client/link/error";
import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";
import { useAuthStore } from "@/lib/stores/auth";

const uploadLink = new UploadHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL,
  credentials: "include",
  headers: {
    Accept: "application/json",
  },
});

const errorLink = new ErrorLink(({ error, operation }) => {
  if (CombinedGraphQLErrors.is(error)) {
    const isUnauthenticated = error.errors.some(
      (e) =>
        e.message === "Unauthenticated." ||
        e.extensions?.category === "authentication"
    );

    if (isUnauthenticated && operation.operationName !== "Me") {
      useAuthStore.getState().logout();
    }

    error.errors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(locations)}, Path: ${path}, Operation: ${operation.operationName}`
      );
    });
  } else {
    console.error(`[Network error]: ${error}`);
  }
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, uploadLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          designers: {
            keyArgs: ["input"],
            merge(existing: Record<string, unknown> | undefined, incoming: Record<string, unknown>) {
              if (!existing) return incoming;
              const existingData = (existing.data ?? []) as unknown[];
              const incomingData = (incoming.data ?? []) as unknown[];
              return {
                ...incoming,
                data: [...existingData, ...incomingData],
              };
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});
