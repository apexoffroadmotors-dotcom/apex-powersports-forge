import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import {
  Boxes,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquareQuote,
  ShoppingBag,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Boxes, exact: false },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag, exact: false },
  { to: "/admin/reviews", label: "Reviews", icon: MessageSquareQuote, exact: false },
  { to: "/admin/subscribers", label: "Subscribers", icon: Mail, exact: false },
] as const;

type GateState = "checking" | "authorized";

function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [gate, setGate] = useState<GateState>("checking");
  const [user, setUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        if (!cancelled) navigate({ to: "/admin/auth", replace: true });
        return;
      }
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin",
      });
      if (cancelled) return;
      if (!isAdmin) {
        navigate({ to: "/admin/auth", replace: true });
        return;
      }
      setUser(session.user);
      setGate("authorized");
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function handleSignOut() {
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/auth", replace: true });
  }

  if (gate === "checking") return null;

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="hidden w-60 shrink-0 flex-col border-r-2 border-ink bg-primary text-primary-foreground lg:flex">
        <SidebarBrand />
        <SidebarNav pathname={pathname} />
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b-2 border-ink bg-primary px-4 py-4 text-primary-foreground sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="border-2 border-primary-foreground/40 p-2 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <p className="font-display text-lg leading-none">
              APEX<span className="text-accent"> ADMIN</span>
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden text-sm text-primary-foreground/80 sm:inline">
              {user?.email}
            </span>
            <Link
              to="/"
              className="micro-label inline-flex items-center gap-2 border-2 border-primary-foreground px-3 py-2.5 hover:bg-primary-foreground hover:text-primary sm:px-4"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Storefront</span>
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="micro-label inline-flex items-center gap-2 border-2 border-primary-foreground bg-accent px-3 py-2.5 text-accent-foreground sm:px-4"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="left"
          className="w-64 border-r-2 border-ink bg-primary p-0 text-primary-foreground [&>button]:text-primary-foreground"
        >
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <SidebarBrand />
          <SidebarNav pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SidebarBrand() {
  return (
    <Link
      to="/admin"
      className="flex items-center gap-2 border-b-2 border-primary-foreground/20 px-5 py-5"
    >
      <img src="/favicon.png" alt={SITE.name} className="h-8 w-8 object-contain" />
      <span className="font-display text-sm leading-none tracking-tight">{SITE.name}</span>
    </Link>
  );
}

function SidebarNav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={`micro-label flex items-center gap-3 border-2 px-4 py-3 transition-colors ${
              active
                ? "border-accent bg-accent text-accent-foreground"
                : "border-transparent text-primary-foreground/70 hover:border-primary-foreground/30 hover:text-primary-foreground"
            }`}
          >
            <item.icon size={16} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
