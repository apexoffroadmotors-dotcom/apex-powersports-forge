import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];

function publicClient() {
  return createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return { products: [] as Product[], error: error.message };
  return { products: (data ?? []) as Product[], error: null as string | null };
});

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!product) return { product: null, reviews: [] as Review[], related: [] as Product[] };

    const [{ data: reviews }, { data: related }] = await Promise.all([
      supabase
        .from("reviews")
        .select("*")
        .eq("product_id", product.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("products")
        .select("*")
        .eq("type", product.type)
        .neq("id", product.id)
        .limit(3),
    ]);

    return {
      product: product as Product,
      reviews: (reviews ?? []) as Review[],
      related: (related ?? []) as Product[],
    };
  });

export const listReviews = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const [{ data: reviews }, { data: products }] = await Promise.all([
    supabase.from("reviews").select("*").order("created_at", { ascending: false }),
    supabase.from("products").select("id,slug,name"),
  ]);
  return {
    reviews: (reviews ?? []) as Review[],
    products: (products ?? []) as Array<{ id: string; slug: string; name: string }>,
  };
});

export const subscribeToNewsletter = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ email: z.string().trim().email().max(255) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { error } = await publicClient()
      .from("newsletter_subscribers")
      .insert({ email: data.email.toLowerCase() });
    if (error && !error.message.includes("duplicate")) {
      return { ok: false, message: "Could not subscribe right now." };
    }
    return { ok: true, message: "You're on the list." };
  });

const orderItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number().int().min(1).max(20),
  image: z.string().optional().nullable(),
});

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        customer_name: z.string().trim().min(2).max(100),
        email: z.string().trim().email().max(255),
        phone: z.string().trim().max(40).optional().default(""),
        address: z.string().trim().max(300).optional().default(""),
        notes: z.string().trim().max(1000).optional().default(""),
        items: z.array(orderItemSchema).min(1).max(20),
        total: z.number().min(0),
        company: z.string().max(0).optional().default(""),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    if (data.company) return { ok: false, id: null as string | null };
    const { data: row, error } = await publicClient()
      .from("orders")
      .insert({
        customer_name: data.customer_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        notes: data.notes,
        items: data.items,
        total: data.total,
      })
      .select("id")
      .maybeSingle();
    if (error) return { ok: false, id: null as string | null };
    return { ok: true, id: row?.id ?? null };
  });
