import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { SITE } from "@/lib/site";
import { blogPosts } from "@/data/blogPosts";

const STATIC_PATHS = [
  "/",
  "/shop",
  "/about",
  "/financing",
  "/reviews",
  "/contact",
  "/blog",
  "/cart",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const supabase = createClient<Database>(
          process.env["SUPABASE_URL"]!,
          process.env["SUPABASE_PUBLISHABLE_KEY"]!,
          { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
        );
        const { data } = await supabase.from("products").select("slug, updated_at");

        const urls = [
          ...STATIC_PATHS.map((p) => ({ loc: `${SITE.url}${p}`, lastmod: null as string | null })),
          ...blogPosts.map((p) => ({ loc: `${SITE.url}/blog/${p.slug}`, lastmod: null })),
          ...(data ?? []).map((p) => ({
            loc: `${SITE.url}/shop/${p.slug}`,
            lastmod: p.updated_at,
          })),
        ];

        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ""}</url>`,
  )
  .join("\n")}
</urlset>`;

        return new Response(body, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
