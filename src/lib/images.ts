/**
 * Product images live in a public storage bucket and are served straight from
 * the storage CDN so they work on any host (Cloudflare, Lovable, etc.) with no
 * server-side credentials involved.
 */
const SUPABASE_URL =
  (import.meta.env['VITE_SUPABASE_URL'] as string | undefined) ??
  "https://drkceyolgwokwljfawbo.supabase.co";

export function productImageUrl(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.replace(/^\/+/, "");
  return `${SUPABASE_URL}/storage/v1/object/public/product-images/${clean
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#e9e4d8"/><text x="400" y="300" text-anchor="middle" font-family="Arial" font-size="28" fill="#7a7a70">Image coming soon</text></svg>`,
  );
