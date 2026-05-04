// Sanctum SPA cookie auth needs the XSRF-TOKEN cookie in place before any
// state-changing request, and Laravel reads the value from the X-XSRF-TOKEN
// header (not the cookie). This module owns: priming the cookie via
// /sanctum/csrf-cookie, reading it back, and resetting state on logout.

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
const apiOrigin = apiUrl.replace(/\/graphql\/?$/, "");

let primed = false;
let inflight: Promise<void> | null = null;

export async function ensureCsrfCookie(): Promise<void> {
  if (typeof window === "undefined") return;
  if (primed) return;
  if (inflight) return inflight;

  inflight = fetch(`${apiOrigin}/sanctum/csrf-cookie`, {
    credentials: "include",
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`csrf prime failed: ${res.status}`);
      }
      primed = true;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function resetCsrfState(): void {
  primed = false;
  inflight = null;
}

export function readXsrfCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
