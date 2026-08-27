import { Link } from "@tanstack/react-router";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { SITE } from "@/lib/site";

const LINKS = [
  { to: "/shop", label: "Inventory" },
  { to: "/financing", label: "Financing" },
  { to: "/reviews", label: "Reviews" },
  { to: "/blog", label: "Journal" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <img src="/favicon.png" alt={SITE.name} className="h-10 w-10 object-contain" />
          <span className="font-display text-lg leading-none tracking-tight text-foreground">
            APEX<span className="text-primary"> OFFROAD</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="micro-label text-foreground transition-colors hover:text-primary"
              activeProps={{ className: "text-primary underline underline-offset-8" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            className="relative grid h-10 w-10 place-items-center border-2 border-ink bg-card text-foreground transition-colors hover:bg-accent"
            aria-label={`Cart with ${count} items`}
          >
            <ShoppingCart size={18} />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center border-2 border-ink bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
          <Link
            to="/admin/auth"
            className="micro-label hidden border-2 border-ink bg-primary px-4 py-2.5 text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:inline-block"
          >
            Login
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center border-2 border-ink bg-card text-foreground lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t-2 border-ink bg-background px-4 py-4 lg:hidden" aria-label="Mobile">
          <ul className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="micro-label block py-3 text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/admin/auth"
                onClick={() => setOpen(false)}
                className="micro-label mt-2 block border-2 border-ink bg-primary px-4 py-3 text-center text-primary-foreground"
              >
                Login
              </Link>
            </li>
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">{SITE.email}</p>
        </nav>
      )}
    </header>
  );
}
