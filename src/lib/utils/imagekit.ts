const IMAGEKIT_ENDPOINT =
  process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ??
  "https://ik.imagekit.io/snad";

export function getImageKitThumbnail(url: string, width = 400): string {
  if (!url.includes("ik.imagekit.io")) return url;

  let path = url.replace(IMAGEKIT_ENDPOINT, "");

  // Strip an existing /tr:... segment so we don't chain transformations
  // (e.g. `tr:w-400,h-400/tr:w-100,h-100/file.jpg`).
  path = path.replace(/^\/tr:[^/]*/, "");

  if (!path.startsWith("/")) path = `/${path}`;

  return `${IMAGEKIT_ENDPOINT}/tr:w-${width},h-${width},c-maintain_ratio,fo-auto${path}`;
}
