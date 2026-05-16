// Server-side GraphQL fetch for Server Components (the public designer
// page). This is NOT the browser Apollo client.
//
// Two problems this solves:
//
//  1. URL: the browser talks to the backend over the public HTTPS
//     `.test` / production domain (NEXT_PUBLIC_API_URL) so cookies stay
//     same-site. Node SSR can't always use that - locally it's a Valet /
//     Herd self-signed cert Node's fetch rejects. Prefer a server-only
//     `API_URL_SERVER` (point it at the plain-HTTP backend, e.g.
//     http://stitchhub.test:8000/graphql), else fall back.
//
//  2. Honest errors: a transport / HTTP / GraphQL-error failure must NOT
//     be silently turned into "not found". The old code did exactly that
//     and rendered a misleading 404 for designers that exist. This
//     throws GraphQLTransportError on failure so the caller can render a
//     real error boundary, and reserves the not-found path for when the
//     backend explicitly says the record doesn't exist.

export class GraphQLTransportError extends Error {}

export function ssrGraphqlEndpoint(): string | null {
  return process.env.API_URL_SERVER ?? process.env.NEXT_PUBLIC_API_URL ?? null;
}

/**
 * Run a GraphQL query from a Server Component. Resolves with `data` on
 * success; throws GraphQLTransportError on any transport/HTTP/GraphQL
 * failure (caller decides: error boundary vs. graceful degrade).
 */
export async function ssrGraphQL<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const url = ssrGraphqlEndpoint();
  if (!url) {
    throw new GraphQLTransportError("No SSR GraphQL endpoint configured");
  }

  // Local dev only: Valet/Herd serves the backend over a self-signed
  // cert that Node's undici fetch rejects. Relax verification for THIS
  // request via a scoped dispatcher - never in production, never global.
  let dispatcher: unknown;
  if (process.env.NODE_ENV !== "production" && url.startsWith("https://")) {
    try {
      const { Agent } = await import("undici");
      dispatcher = new Agent({ connect: { rejectUnauthorized: false } });
    } catch {
      // undici not resolvable in this runtime - fall back to default
      // fetch. The operator can still fix it via API_URL_SERVER.
    }
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 60 },
      // `dispatcher` is an undici RequestInit extension not in lib.dom.
      ...(dispatcher ? { dispatcher } : {}),
    } as RequestInit);
  } catch (err) {
    throw new GraphQLTransportError(
      `SSR GraphQL fetch failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  if (!res.ok) {
    throw new GraphQLTransportError(`SSR GraphQL HTTP ${res.status}`);
  }

  let json: { data?: T; errors?: unknown };
  try {
    json = (await res.json()) as { data?: T; errors?: unknown };
  } catch (err) {
    throw new GraphQLTransportError(
      `SSR GraphQL invalid JSON: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  if (json.errors) {
    throw new GraphQLTransportError(
      `SSR GraphQL errors: ${JSON.stringify(json.errors)}`
    );
  }

  return json.data as T;
}
