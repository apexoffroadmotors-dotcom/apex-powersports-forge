import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  Boxes,
  ClipboardList,
  ExternalLink,
  LogOut,
  Mail,
  MessageSquareQuote,
  ShoppingBag,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SITE, formatPrice } from "@/lib/site";
import type { Database } from "@/integrations/supabase/types";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: `Admin dashboard | ${SITE.name}` },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboard,
});

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-accent text-accent-foreground",
  contacted: "bg-secondary text-secondary-foreground",
  completed: "bg-primary text-primary-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    products: 0,
    available: 0,
    orders: 0,
    pending: 0,
    reviews: 0,
    subscribers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<OrderRow[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate({ to: "/admin/auth" });
        return;
      }
      setUser(data.session.user);
      setChecking(false);
    });
  }, [navigate]);

  useEffect(() => {
    if (checking) return;
    let cancelled = false;
    (async () => {
      const [products, available, orders, pending, reviews, subscribers, recent] =
        await Promise.all([
          supabase.from("products").select("*", { count: "exact", head: true }),
          supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("is_available", true),
          supabase.from("orders").select("*", { count: "exact", head: true }),
          supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
          supabase.from("reviews").select("*", { count: "exact", head: true }),
          supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
          supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10),
        ]);
      if (cancelled) return;
      setStats({
        products: products.count ?? 0,
        available: available.count ?? 0,
        orders: orders.count ?? 0,
        pending: pending.count ?? 0,
        reviews: reviews.count ?? 0,
        subscribers: subscribers.count ?? 0,
      });
      setRecentOrders((recent.data as OrderRow[] | null) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [checking]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/admin/auth" });
  }

  if (checking) return null;

  const cards = [
    { icon: Boxes, label: "Products in stock", value: `${stats.available} / ${stats.products}` },
    { icon: ShoppingBag, label: "Orders (pending)", value: `${stats.orders} (${stats.pending})` },
    { icon: MessageSquareQuote, label: "Published reviews", value: stats.reviews },
    { icon: Mail, label: "Newsletter subscribers", value: stats.subscribers },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-2 border-ink bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div>
            <p className="micro-label text-accent">Admin</p>
            <h1 className="font-display text-2xl">APEX OFFROAD DASHBOARD</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-primary-foreground/80">{user?.email}</span>
            <Link
              to="/"
              className="micro-label inline-flex items-center gap-2 border-2 border-primary-foreground px-4 py-2.5 hover:bg-primary-foreground hover:text-primary"
            >
              <ExternalLink size={14} /> Storefront
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="micro-label inline-flex items-center gap-2 border-2 border-primary-foreground bg-accent px-4 py-2.5 text-accent-foreground"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="border-2 border-ink bg-card p-5">
              <c.icon className="text-primary" size={22} />
              <p className="mt-4 font-display text-3xl text-foreground">
                {loading ? "…" : c.value}
              </p>
              <p className="micro-label mt-1 text-muted-foreground">{c.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 border-2 border-ink bg-card">
          <div className="flex items-center gap-2 border-b-2 border-ink px-5 py-4">
            <ClipboardList size={18} className="text-primary" />
            <h2 className="font-display text-lg text-foreground">Recent orders</h2>
          </div>
          {loading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading…</p>
          ) : recentOrders.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-ink text-muted-foreground">
                    <th className="micro-label px-5 py-3 font-normal">Customer</th>
                    <th className="micro-label px-5 py-3 font-normal">Email</th>
                    <th className="micro-label px-5 py-3 font-normal">Total</th>
                    <th className="micro-label px-5 py-3 font-normal">Status</th>
                    <th className="micro-label px-5 py-3 font-normal">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-border last:border-b-0">
                      <td className="px-5 py-3 text-foreground">{o.customer_name}</td>
                      <td className="px-5 py-3 text-muted-foreground">{o.email}</td>
                      <td className="px-5 py-3 font-semibold text-primary">
                        {formatPrice(o.total)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`micro-label inline-block border-2 border-ink px-2 py-1 ${STATUS_STYLES[o.status] ?? ""}`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Product, order and review editing lives in your Supabase dashboard for now — this view
          is a quick-glance summary.
        </p>
      </main>
    </div>
  );
}
