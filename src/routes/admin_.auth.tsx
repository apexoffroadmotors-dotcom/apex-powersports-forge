import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Lock, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/admin_/auth")({
  head: () => ({
    meta: [
      { title: `Admin sign in | ${SITE.name}` },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminAuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Use at least 6 characters").max(200),
});

function AdminAuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate({ to: "/admin" });
      } else {
        setChecking(false);
      }
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      if (error) {
        toast.error(error.message);
        return;
      }
      navigate({ to: "/admin" });
    } finally {
      setBusy(false);
    }
  }

  if (checking) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4 py-12 text-primary-foreground">
      <div className="w-full max-w-sm">
        <Link to="/" className="mx-auto flex w-fit items-center gap-2">
          <span className="grid h-9 w-9 place-items-center border-2 border-primary-foreground bg-accent font-display text-sm text-accent-foreground">
            A
          </span>
          <span className="font-display text-lg leading-none tracking-tight">
            APEX<span className="text-accent"> OFFROAD</span>
          </span>
        </Link>

        <div className="mt-8 border-2 border-primary-foreground/30 bg-primary p-6 sm:p-8">
          <p className="micro-label mb-6 text-center text-primary-foreground/70">Admin sign in</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="au-email"
                className="micro-label mb-1 flex items-center gap-2 text-primary-foreground/70"
              >
                <Mail size={14} /> Email
              </label>
              <input
                id="au-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-primary-foreground/30 bg-primary px-3 py-2.5 text-sm text-primary-foreground outline-none focus:ring-2 focus:ring-accent"
              />
              {errors.email && <p className="mt-1 text-xs text-accent">{errors.email}</p>}
            </div>
            <div>
              <label
                htmlFor="au-password"
                className="micro-label mb-1 flex items-center gap-2 text-primary-foreground/70"
              >
                <Lock size={14} /> Password
              </label>
              <input
                id="au-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-primary-foreground/30 bg-primary px-3 py-2.5 text-sm text-primary-foreground outline-none focus:ring-2 focus:ring-accent"
              />
              {errors.password && <p className="mt-1 text-xs text-accent">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={busy}
              className="micro-label w-full border-2 border-primary-foreground bg-accent px-5 py-3 text-accent-foreground transition-colors hover:bg-primary-foreground disabled:opacity-60"
            >
              {busy ? "…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-primary-foreground/60">
          Staff access only.{" "}
          <Link to="/" className="underline hover:text-accent">
            Back to storefront
          </Link>
        </p>
      </div>
    </div>
  );
}
