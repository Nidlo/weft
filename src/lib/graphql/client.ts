import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client/core";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { ErrorLink } from "@apollo/client/link/error";

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL,
  credentials: "include",
  headers: {
    Accept: "application/json",
  },
});

const errorLink = new ErrorLink(({ error, operation }) => {
  if (CombinedGraphQLErrors.is(error)) {
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
  link: errorLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          searchDesigners: {
            keyArgs: ["input"],
            merge(_existing: unknown, incoming: unknown) {
              return incoming;
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
