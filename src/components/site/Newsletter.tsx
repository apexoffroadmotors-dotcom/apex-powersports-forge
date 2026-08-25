import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { z } from "zod";
import { subscribeToNewsletter } from "@/lib/catalog.functions";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const subscribe = useServerFn(subscribeToNewsletter);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = z.string().trim().email().max(255).safeParse(email);
    if (!parsed.success) {
      toast.error("Enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      const res = await subscribe({ data: { email: parsed.data } });
      if (res.ok) {
        toast.success(res.message);
        setEmail("");
      } else {
        toast.error(res.message);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-lg gap-0">
      <label className="sr-only" htmlFor={compact ? "nl-compact" : "nl-main"}>
        Email address
      </label>
      <input
        id={compact ? "nl-compact" : "nl-main"}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="min-w-0 flex-1 border-2 border-ink bg-card px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-accent"
      />
      <button
        type="submit"
        disabled={busy}
        className="micro-label border-2 border-l-0 border-ink bg-accent px-5 py-3 text-accent-foreground transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-60"
      >
        {busy ? "…" : "Subscribe"}
      </button>
    </form>
  );
}
