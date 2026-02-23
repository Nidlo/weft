const IMAGEKIT_ENDPOINT =
  process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? "https://ik.imagekit.io/snad";

export function getImageKitThumbnail(url: string, width = 400): string {
  if (!url.includes("ik.imagekit.io")) return url;

  const path = url.replace(IMAGEKIT_ENDPOINT, "");

  return `${IMAGEKIT_ENDPOINT}/tr:w-${width},h-${width},c-maintain_ratio,fo-auto${path}`;
}
