import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Copy, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site";
import type { Database } from "@/integrations/supabase/types";

type Subscriber = Database["public"]["Tables"]["newsletter_subscribers"]["Row"];

export const Route = createFileRoute("/admin/subscribers")({
  head: () => ({ meta: [{ title: `Subscribers | ${SITE.name} admin` }] }),
  component: AdminSubscribers,
});

function AdminSubscribers() {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      setRows((data as Subscriber[] | null) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function copyAll() {
    await navigator.clipboard.writeText(rows.map((r) => r.email).join(", "));
    toast.success("Email list copied");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="micro-label text-primary">Marketing</p>
          <h1 className="font-display text-2xl text-foreground">SUBSCRIBERS</h1>
        </div>
        <button
          type="button"
          onClick={copyAll}
          disabled={rows.length === 0}
          className="micro-label inline-flex items-center gap-2 border-2 border-ink px-4 py-2.5 text-foreground disabled:opacity-50"
        >
          <Copy size={14} /> Copy all emails
        </button>
      </div>

      <div className="mt-6 border-2 border-ink bg-card">
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No subscribers yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <span className="flex items-center gap-2 text-foreground">
                  <Mail size={14} className="text-primary" /> {r.email}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
