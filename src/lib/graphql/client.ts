import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
} from "@apollo/client/core";
import { CombinedGraphQLErrors, ServerError } from "@apollo/client/errors";
import { ErrorLink } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";
import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";
import { useAuthStore } from "@/lib/stores/auth";
import { ensureCsrfCookie, resetCsrfState, readXsrfCookie } from "@/lib/graphql/csrf";
import { ME_QUERY } from "@/lib/graphql/queries/auth";

const uploadLink = new UploadHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL,
  credentials: "include",
  headers: {
    Accept: "application/json",
  },
});

// Sanctum SPA-cookie CSRF: mirror the XSRF-TOKEN cookie as the X-XSRF-TOKEN
// header on every operation. Laravel reads the header (not the cookie) for
// CSRF validation. The cookie itself is primed by ensureCsrfCookie() in
// AuthProvider on mount.
const csrfLink = new ApolloLink((operation, forward) => {
  const token = readXsrfCookie();
  if (token) {
    operation.setContext(
      ({ headers = {} }: { headers?: Record<string, string> }) => ({
        headers: { ...headers, "X-XSRF-TOKEN": token },
      })
    );
  }
  return forward(operation);
});

// Sanctum returns 419 when XSRF-TOKEN expires mid-session. Re-warm the cookie
// once and retry transparently — preserves the in-flight mutation that would
// otherwise be lost.
const retryLink = new RetryLink({
  attempts: {
    max: 2,
    retryIf: async (error) => {
      if (!ServerError.is(error) || error.statusCode !== 419) return false;
      resetCsrfState();
      await ensureCsrfCookie();
      return true;
    },
  },
  delay: { initial: 0, max: 0, jitter: false },
});

// One-shot Me probe state. A non-Me Unauthenticated could be a real session
// death OR a race (cookie not yet primed, stale request from a previous
// route, CSRF blip). Probing Me distinguishes the two — only logout when
// Me also fails. inFlight dedupes concurrent probes (e.g. several queries
// all 401 at once after a session expiry); pending: true stops a thundering
// herd of probes from firing in the same tick.
let probeInFlight: Promise<void> | null = null;

// Exported for tests. Production callers go through errorLink — the public
// surface of this module is just `apolloClient`.
export function probeSessionAndLogoutIfDead(): Promise<void> {
  if (probeInFlight) return probeInFlight;
  probeInFlight = apolloClient
    .query({ query: ME_QUERY, fetchPolicy: "network-only" })
    .then((res) => {
      // Apollo v4 default errorPolicy is "none" — a GraphQL error rejects.
      // If we resolve here and `me` is null, the server confirms no session.
      if (!res.data || !(res.data as { me?: unknown }).me) {
        useAuthStore.getState().logout();
      }
    })
    .catch(() => {
      // Me itself rejected (Unauthenticated or network). Either way the
      // session is not usable — log the user out so the UI re-routes them.
      useAuthStore.getState().logout();
    })
    .finally(() => {
      probeInFlight = null;
    });
  return probeInFlight;
}

const errorLink = new ErrorLink(({ error, operation }) => {
  if (CombinedGraphQLErrors.is(error)) {
    const isUnauthenticated = error.errors.some(
      (e) =>
        e.message === "Unauthenticated." ||
        e.extensions?.category === "authentication"
    );

    if (isUnauthenticated && operation.operationName !== "Me") {
      // Defer logout: probe Me first. Without this, ANY transient
      // Unauthenticated (e.g. UnreadMessagesCount fired by RealtimeProvider
      // racing the freshly-set session cookie post-verifyOtp) silently
      // kicks the just-logged-in user back to /auth/phone — the user
      // sees the OTP form again and assumes their code was rejected.
      probeSessionAndLogoutIfDead();
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

/**
 * Shape of a paginated `designers` page in the Apollo cache. The runtime
 * value is whatever the resolver returns; we only require a `data` array,
 * which is the only field this merge mutates. Other fields (`paginatorInfo`,
 * etc.) flow through untouched. Closes audit M1 — explicit type instead of
 * the previous `Record<string, unknown>` shrug.
 */
interface DesignerPage {
  data?: unknown[];
  [key: string]: unknown;
}

/**
 * Merge function for paginated `designers` queries. Exported so the dedupe
 * contract (B9 / audit H9) is independently unit-testable.
 *
 * - First page (no `after` cursor) replaces the cache entry — covers initial
 *   loads + filter changes that should *reset* rather than append.
 * - Subsequent pages (with `after`) concatenate onto the existing data array.
 */
export function mergeDesignerPage(
  existing: DesignerPage | undefined,
  incoming: DesignerPage,
  args: Record<string, unknown> | null,
): DesignerPage {
  if (!existing || !args?.after) return incoming;
  const existingData = existing.data ?? [];
  const incomingData = incoming.data ?? [];
  return {
    ...incoming,
    data: [...existingData, ...incomingData],
  };
}

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([retryLink, csrfLink, errorLink, uploadLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          designers: {
            keyArgs: ["input"],
            merge(existing, incoming, { args }) {
              return mergeDesignerPage(
                existing as DesignerPage | undefined,
                incoming as DesignerPage,
                args,
              );
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
