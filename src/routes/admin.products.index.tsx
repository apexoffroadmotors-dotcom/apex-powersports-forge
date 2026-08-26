import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { productImageUrl, PLACEHOLDER_IMAGE } from "@/lib/images";
import { CONDITION_LABELS, formatPrice, SITE, STATUS_LABELS, TYPE_LABELS } from "@/lib/site";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

export const Route = createFileRoute("/admin/products/")({
  head: () => ({ meta: [{ title: `Products | ${SITE.name} admin` }] }),
  component: AdminProducts,
});

function AdminProducts() {
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  async function load() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as Product[] | null) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) =>
      [r.name, r.brand, r.model, r.slug].join(" ").toLowerCase().includes(needle),
    );
  }, [rows, q]);

  async function remove(row: Product) {
    if (!confirm(`Delete "${row.name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Product deleted");
    setRows((prev) => prev.filter((p) => p.id !== row.id));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="micro-label text-primary">Inventory</p>
          <h1 className="font-display text-2xl text-foreground">PRODUCTS</h1>
        </div>
        <Link
          to="/admin/products/new"
          className="micro-label inline-flex items-center gap-2 border-2 border-ink bg-primary px-4 py-2.5 text-primary-foreground"
        >
          <Plus size={14} /> Add product
        </Link>
      </div>

      <label className="mt-6 flex items-center gap-2 border-2 border-ink bg-card px-3 py-2.5">
        <Search size={16} className="text-muted-foreground" />
        <span className="sr-only">Search products</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, brand or model"
          className="w-full bg-transparent text-sm outline-none"
        />
      </label>

      <div className="mt-6 border-2 border-ink bg-card">
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No products found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-ink text-muted-foreground">
                  <th className="micro-label px-4 py-3 font-normal">Machine</th>
                  <th className="micro-label px-4 py-3 font-normal">Type</th>
                  <th className="micro-label px-4 py-3 font-normal">Condition</th>
                  <th className="micro-label px-4 py-3 font-normal">Price</th>
                  <th className="micro-label px-4 py-3 font-normal">Stock</th>
                  <th className="micro-label px-4 py-3 font-normal">Status</th>
                  <th className="micro-label px-4 py-3 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={productImageUrl(p.images?.[0]) || PLACEHOLDER_IMAGE}
                          alt={p.name}
                          loading="lazy"
                          className="h-12 w-16 border-2 border-ink object-cover"
                        />
                        <div>
                          <p className="font-semibold text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.brand} {p.model} {p.year ?? ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{TYPE_LABELS[p.type]}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {CONDITION_LABELS[p.condition]}
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.stock}</td>
                    <td className="px-4 py-3">
                      <span className="micro-label border-2 border-ink px-2 py-1">
                        {STATUS_LABELS[p.listing_status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          to="/admin/products/$id"
                          params={{ id: p.id }}
                          aria-label={`Edit ${p.name}`}
                          className="border-2 border-ink p-2 text-foreground hover:bg-secondary"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          type="button"
                          aria-label={`Delete ${p.name}`}
                          onClick={() => remove(p)}
                          className="border-2 border-ink bg-destructive p-2 text-destructive-foreground"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
