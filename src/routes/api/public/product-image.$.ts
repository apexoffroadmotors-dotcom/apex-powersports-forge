import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Serves product photos from the private storage bucket using the publishable
 * key (an anon SELECT policy on the bucket allows reads). This avoids needing
 * a service-role secret on the hosting platform.
 */
export const Route = createFileRoute("/api/public/product-image/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = decodeURIComponent((params as { _splat?: string })._splat ?? "");
        if (!path || path.includes("..")) {
          return new Response("Not found", { status: 404 });
        }

        const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
        const key =
          process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
        if (!url || !key) {
          return new Response("Storage not configured", { status: 500 });
        }

        const client = createClient<Database>(url, key, {
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        });

        const { data, error } = await client.storage.from("product-images").download(path);
        if (error || !data) {
          return new Response("Not found", { status: 404 });
        }

        return new Response(await data.arrayBuffer(), {
          headers: {
            "content-type": data.type || "image/jpeg",
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
