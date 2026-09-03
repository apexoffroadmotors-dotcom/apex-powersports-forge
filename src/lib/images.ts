/**
 * Product images live in a private storage bucket and are served through a
 * cached public proxy route so they stay crawlable and never expire.
 */
export function productImageUrl(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.replace(/^\/+/, "");
  return `/api/public/product-image/${clean.split("/").map(encodeURIComponent).join("/")}`;
}

/**
 * Product videos live in a private storage bucket and are served through a
 * range-forwarding proxy route so browsers can seek/scrub playback.
 */
export function productVideoUrl(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.replace(/^\/+/, "");
  return `/api/public/product-video/${clean.split("/").map(encodeURIComponent).join("/")}`;
}

export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#e9e4d8"/><text x="400" y="300" text-anchor="middle" font-family="Arial" font-size="28" fill="#7a7a70">Image coming soon</text></svg>`,
  );
