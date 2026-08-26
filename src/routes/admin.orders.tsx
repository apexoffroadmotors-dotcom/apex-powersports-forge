import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Search, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, SITE } from "@/lib/site";
import type { Database } from "@/integrations/supabase/types";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type OrderStatus = Database["public"]["Enums"]["order_status"];

const STATUSES: OrderStatus[] = ["pending", "contacted", "completed", "cancelled"];

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: `Orders | ${SITE.name} admin` }] }),
  component: AdminOrders,
});

function AdminOrders() {
  const [rows, setRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) toast.error(error.message);
      setRows((data as Order[] | null) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (status && r.status !== status) return false;
      if (!needle) return true;
      return [r.customer_name, r.email, r.phone ?? ""].join(" ").toLowerCase().includes(needle);
    });
  }, [rows, q, status]);

  async function updateStatus(order: Order, next: OrderStatus) {
    const { error } = await supabase.from("orders").update({ status: next }).eq("id", order.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRows((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: next } : o)));
    toast.success(`Marked ${next}`);
  }

  async function remove(order: Order) {
    if (!confirm(`Delete the order from ${order.customer_name}?`)) return;
    const { error } = await supabase.from("orders").delete().eq("id", order.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRows((prev) => prev.filter((o) => o.id !== order.id));
    toast.success("Order deleted");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="micro-label text-primary">Sales</p>
      <h1 className="font-display text-2xl text-foreground">ORDERS</h1>

      <div className="mt-6 flex flex-wrap gap-3">
        <label className="flex min-w-[220px] flex-1 items-center gap-2 border-2 border-ink bg-card px-3 py-2.5">
          <Search size={16} className="text-muted-foreground" />
          <span className="sr-only">Search orders</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email or phone"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
          className="border-2 border-ink bg-card px-3 py-2.5 text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="border-2 border-ink bg-card p-6 text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="border-2 border-ink bg-card p-6 text-sm text-muted-foreground">
            No orders match.
          </p>
        ) : (
          filtered.map((o) => {
            const items = Array.isArray(o.items)
              ? (o.items as Array<{ name?: string; quantity?: number; price?: number }>)
              : [];
            const expanded = open === o.id;
            return (
              <div key={o.id} className="border-2 border-ink bg-card">
                <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold text-foreground">{o.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.email} · {new Date(o.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-lg text-primary">
                      {formatPrice(o.total)}
                    </span>
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o, e.target.value as OrderStatus)}
                      aria-label={`Status for ${o.customer_name}`}
                      className="border-2 border-ink bg-card px-2 py-2 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setOpen(expanded ? null : o.id)}
                      className="micro-label inline-flex items-center gap-1 border-2 border-ink px-3 py-2"
                    >
                      {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Details
                    </button>
                    <button
                      type="button"
                      aria-label="Delete order"
                      onClick={() => remove(o)}
                      className="border-2 border-ink bg-destructive p-2 text-destructive-foreground"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {expanded && (
                  <div className="border-t-2 border-ink p-4 text-sm">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <p className="text-muted-foreground">
                        <span className="micro-label block">Phone</span>
                        {o.phone || "—"}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="micro-label block">Address</span>
                        {o.address || "—"}
                      </p>
                      <p className="text-muted-foreground sm:col-span-2">
                        <span className="micro-label block">Notes</span>
                        {o.notes || "—"}
                      </p>
                    </div>
                    <ul className="mt-4 divide-y divide-border border-2 border-ink">
                      {items.map((item, i) => (
                        <li key={i} className="flex justify-between px-3 py-2">
                          <span className="text-foreground">
                            {item.name} × {item.quantity ?? 1}
                          </span>
                          <span className="text-muted-foreground">
                            {formatPrice((item.price ?? 0) * (item.quantity ?? 1))}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
