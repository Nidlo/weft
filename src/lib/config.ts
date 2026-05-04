export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Build version surfaced in /settings → About. Vercel injects the commit
 * SHA into `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA`; locally we fall back to
 * the package.json semver, then `dev` if neither is present.
 * (FE-NIDLO-SETTINGS-06)
 */
export const APP_VERSION =
  process.env.NEXT_PUBLIC_APP_VERSION ??
  (process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
    ? process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA.slice(0, 7)
    : "dev");
