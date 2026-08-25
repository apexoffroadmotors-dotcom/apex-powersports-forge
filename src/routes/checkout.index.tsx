import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Truck, Banknote } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CheckoutModal } from "@/components/site/CheckoutModal";
import { useCart } from "@/context/CartContext";
import { seo } from "@/lib/seo";
import { formatPrice } from "@/lib/site";

export const Route = createFileRoute("/checkout/")({
  head: () =>
    seo({
      title: "Checkout | Apex Offroad Motors",
      description:
        "Confirm your ATV or side-by-side order. Our team verifies pricing, delivery and paperwork before any payment is taken.",
      path: "/checkout",
    }),
  component: CheckoutPage,
});

const TRUST = [
  { icon: ShieldCheck, title: "No payment online", body: "We confirm pricing and paperwork first." },
  { icon: Truck, title: "Nationwide delivery", body: "Enclosed transport quoted per address." },
  { icon: Banknote, title: "Financing available", body: "Pre-qualification in under 24 hours." },
];

function CheckoutPage() {
  const { items, total, clear } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <SiteLayout>
      <section className="border-b-2 border-ink bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="micro-label text-accent">Checkout</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl">CONFIRM YOUR ORDER</h1>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {items.length === 0 ? (
          <div className="border-2 border-ink bg-card p-10 text-center">
            <p className="font-display text-2xl text-foreground">Nothing to check out</p>
            <Link
              to="/shop"
              className="micro-label mt-6 inline-block border-2 border-ink bg-primary px-5 py-3 text-primary-foreground"
            >
              Browse inventory
            </Link>
          </div>
        ) : (
          <>
            <ul className="border-2 border-ink bg-card">
              {items.map((i) => (
                <li
                  key={i.id}
                  className="flex items-center justify-between gap-3 border-b-2 border-ink px-4 py-3 text-sm last:border-b-0"
                >
                  <span className="text-foreground">
                    {i.quantity}× {i.name}
                  </span>
                  <span className="font-display text-primary">
                    {formatPrice(i.price * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex justify-between font-display text-2xl text-foreground">
              <span>Total</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="micro-label mt-6 w-full border-2 border-ink bg-primary px-5 py-4 text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Enter your details
            </button>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {TRUST.map((t) => (
                <div key={t.title} className="border-2 border-ink bg-card p-4">
                  <t.icon className="text-primary" size={20} />
                  <p className="mt-3 font-display text-base text-foreground">{t.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t.body}</p>
                </div>
              ))}
            </div>

            <CheckoutModal
              open={open}
              onClose={() => setOpen(false)}
              items={items}
              onComplete={clear}
            />
          </>
        )}
      </div>
    </SiteLayout>
  );
}
