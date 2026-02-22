export function getCloudinaryThumbnail(url: string, width = 400): string {
  if (!url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/w_${width},c_fill,q_auto,f_auto/`);
}
