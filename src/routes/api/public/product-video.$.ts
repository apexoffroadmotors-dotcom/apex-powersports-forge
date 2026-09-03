import { createFileRoute } from "@tanstack/react-router";

/**
 * Serves product videos from the private storage bucket, forwarding Range
 * requests so browsers can seek/scrub playback instead of downloading the
 * whole file. Uses the publishable key — an anon SELECT policy on the
 * bucket allows reads — so no service-role secret is needed on the host.
 */
export const Route = createFileRoute("/api/public/product-video/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
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

        const objectUrl = `${url.replace(/\/+$/, "")}/storage/v1/object/product-videos/${path
          .split("/")
          .map(encodeURIComponent)
          .join("/")}`;

        const range = request.headers.get("range");
        const upstream = await fetch(objectUrl, {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            ...(range ? { Range: range } : {}),
          },
        });

        if (!upstream.ok && upstream.status !== 206) {
          return new Response("Not found", { status: 404 });
        }

        const headers = new Headers();
        headers.set("content-type", upstream.headers.get("content-type") || "video/mp4");
        headers.set("accept-ranges", "bytes");
        headers.set("cache-control", "public, max-age=31536000, immutable");
        const contentRange = upstream.headers.get("content-range");
        if (contentRange) headers.set("content-range", contentRange);
        const contentLength = upstream.headers.get("content-length");
        if (contentLength) headers.set("content-length", contentLength);

        return new Response(upstream.body, { status: upstream.status, headers });
      },
    },
  },
});
