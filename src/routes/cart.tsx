import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useCart } from "@/context/CartContext";
import { seo } from "@/lib/seo";
import { formatPrice } from "@/lib/site";
import { PLACEHOLDER_IMAGE, productImageUrl } from "@/lib/images";

export const Route = createFileRoute("/cart")({
  head: () =>
    seo({
      title: "Your Cart | Apex Offroad Motors",
      description:
        "Review the ATVs and side-by-sides you selected, adjust quantities and continue to a secure, no-pressure checkout with nationwide delivery.",
      path: "/cart",
    }),
  component: CartPage,
});

function CartPage() {
  const { items, total, remove, setQuantity } = useCart();

  return (
    <SiteLayout>
      <section className="border-b-2 border-ink bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="micro-label text-accent">Cart</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl">YOUR BUILD LIST</h1>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {items.length === 0 ? (
          <div className="border-2 border-ink bg-card p-10 text-center">
            <p className="font-display text-2xl text-foreground">Your cart is empty</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Add a machine from the inventory and it will show up here.
            </p>
            <Link
              to="/shop"
              className="micro-label mt-6 inline-block border-2 border-ink bg-primary px-5 py-3 text-primary-foreground"
            >
              Browse inventory
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
            <ul className="border-2 border-ink bg-card">
              {items.map((i) => (
                <li
                  key={i.id}
                  className="flex flex-wrap items-center gap-4 border-b-2 border-ink p-4 last:border-b-0"
                >
                  <img
                    src={productImageUrl(i.image) || PLACEHOLDER_IMAGE}
                    alt={i.name}
                    loading="lazy"
                    className="h-20 w-28 border-2 border-ink object-cover"
                  />
                  <div className="min-w-40 flex-1">
                    <Link
                      to="/shop/$slug"
                      params={{ slug: i.slug }}
                      className="font-display text-lg text-foreground hover:text-primary"
                    >
                      {i.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">{formatPrice(i.price)} each</p>
                  </div>
                  <div className="flex items-center border-2 border-ink">
                    <button
                      type="button"
                      onClick={() => setQuantity(i.id, i.quantity - 1)}
                      className="grid h-9 w-9 place-items-center hover:bg-accent"
                      aria-label={`Decrease quantity of ${i.name}`}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-bold">{i.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(i.id, i.quantity + 1)}
                      className="grid h-9 w-9 place-items-center hover:bg-accent"
                      aria-label={`Increase quantity of ${i.name}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="w-28 text-right font-display text-lg text-primary">
                    {formatPrice(i.price * i.quantity)}
                  </p>
                  <button
                    type="button"
                    onClick={() => remove(i.id)}
                    className="grid h-9 w-9 place-items-center border-2 border-ink text-foreground hover:bg-destructive hover:text-destructive-foreground"
                    aria-label={`Remove ${i.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>

            <aside className="h-fit border-2 border-ink bg-card p-5">
              <p className="micro-label text-muted-foreground">Summary</p>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Units</dt>
                  <dd className="text-foreground">{items.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd className="text-foreground">Quoted at confirmation</dd>
                </div>
              </dl>
              <p className="mt-4 flex justify-between border-t-2 border-ink pt-4 font-display text-xl text-foreground">
                <span>Total</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </p>
              <Link
                to="/checkout"
                className="micro-label mt-5 block border-2 border-ink bg-primary px-5 py-3 text-center text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Checkout
              </Link>
              <Link
                to="/shop"
                className="micro-label mt-2 block border-2 border-ink px-5 py-3 text-center text-foreground"
              >
                Keep shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
