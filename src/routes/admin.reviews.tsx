import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Stars } from "@/components/site/Stars";
import { SITE } from "@/lib/site";
import type { Database } from "@/integrations/supabase/types";

type Review = Database["public"]["Tables"]["reviews"]["Row"];

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({ meta: [{ title: `Reviews | ${SITE.name} admin` }] }),
  component: AdminReviews,
});

const schema = z.object({
  author_name: z.string().trim().min(2, "Name is required").max(80),
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(5, "Write a short review").max(1500),
  product_id: z.string().nullable(),
});

const inputClass =
  "w-full border-2 border-ink bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary";

function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ author_name: "", rating: "5", body: "", product_id: "" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data: r }, { data: p }] = await Promise.all([
        supabase.from("reviews").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("id,name").order("name"),
      ]);
      if (cancelled) return;
      setReviews((r as Review[] | null) ?? []);
      setProducts((p as Array<{ id: string; name: string }> | null) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({
      author_name: form.author_name,
      rating: Number(form.rating),
      body: form.body,
      product_id: form.product_id || null,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const { data, error } = await supabase
        .from("reviews")
        .insert(parsed.data)
        .select("*")
        .maybeSingle();
      if (error) {
        toast.error(error.message);
        return;
      }
      setReviews((prev) => [data as Review, ...prev]);
      setForm({ author_name: "", rating: "5", body: "", product_id: "" });
      toast.success("Review published");
    } finally {
      setBusy(false);
    }
  }

  async function remove(review: Review) {
    if (!confirm(`Delete the review by ${review.author_name}?`)) return;
    const { error } = await supabase.from("reviews").delete().eq("id", review.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setReviews((prev) => prev.filter((r) => r.id !== review.id));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="micro-label text-primary">Social proof</p>
      <h1 className="font-display text-2xl text-foreground">REVIEWS</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <form onSubmit={add} className="space-y-4 border-2 border-ink bg-card p-5">
          <h2 className="font-display text-lg text-foreground">Add review</h2>
          <div>
            <label className="micro-label mb-1 block text-muted-foreground" htmlFor="r-author">
              Customer name
            </label>
            <input
              id="r-author"
              className={inputClass}
              value={form.author_name}
              onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))}
            />
            {errors["author_name"] && (
              <p className="mt-1 text-xs text-destructive">{errors["author_name"]}</p>
            )}
          </div>
          <div>
            <label className="micro-label mb-1 block text-muted-foreground" htmlFor="r-rating">
              Rating
            </label>
            <select
              id="r-rating"
              className={inputClass}
              value={form.rating}
              onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} star{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="micro-label mb-1 block text-muted-foreground" htmlFor="r-product">
              Machine (optional)
            </label>
            <select
              id="r-product"
              className={inputClass}
              value={form.product_id}
              onChange={(e) => setForm((f) => ({ ...f, product_id: e.target.value }))}
            >
              <option value="">General review</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="micro-label mb-1 block text-muted-foreground" htmlFor="r-body">
              Review
            </label>
            <textarea
              id="r-body"
              rows={5}
              className={inputClass}
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            />
            {errors["body"] && <p className="mt-1 text-xs text-destructive">{errors["body"]}</p>}
          </div>
          <button
            type="submit"
            disabled={busy}
            className="micro-label inline-flex w-full items-center justify-center gap-2 border-2 border-ink bg-primary px-4 py-3 text-primary-foreground disabled:opacity-60"
          >
            <Plus size={14} /> {busy ? "Saving…" : "Publish review"}
          </button>
        </form>

        <div className="space-y-3 lg:col-span-2">
          {loading ? (
            <p className="border-2 border-ink bg-card p-6 text-sm text-muted-foreground">
              Loading…
            </p>
          ) : reviews.length === 0 ? (
            <p className="border-2 border-ink bg-card p-6 text-sm text-muted-foreground">
              No reviews yet.
            </p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="border-2 border-ink bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{r.author_name}</p>
                    <Stars rating={r.rating} />
                  </div>
                  <button
                    type="button"
                    aria-label="Delete review"
                    onClick={() => remove(r)}
                    className="border-2 border-ink bg-destructive p-2 text-destructive-foreground"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{r.body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
