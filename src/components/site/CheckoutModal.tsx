import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, X } from "lucide-react";
import { createOrder } from "@/lib/catalog.functions";
import type { CartItem } from "@/context/CartContext";
import { SITE, formatPrice } from "@/lib/site";

const schema = z.object({
  customer_name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(6, "Enter a phone number").max(40),
  address: z.string().trim().min(5, "Enter a delivery address").max(300),
  notes: z.string().trim().min(5, "Tell us a little about what you need").max(1000),
});

export function CheckoutModal({
  open,
  onClose,
  items,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  onComplete?: () => void;
}) {
  const submitOrder = useServerFn(createOrder);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open) return null;
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (String(fd.get("company") ?? "")) return; // honeypot
    const parsed = schema.safeParse(Object.fromEntries(fd) as Record<string, string>);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const res = await submitOrder({
        data: {
          ...parsed.data,
          items: items.map((i) => ({
            id: i.id,
            slug: i.slug,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image ?? null,
          })),
          total,
          company: "",
        },
      });
      if (!res.ok) {
        toast.error("We couldn't record that order. Please try again.");
        return;
      }
      // Notify the sales inbox (best effort).
      try {
        await fetch(SITE.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            _subject: `New order — ${parsed.data.customer_name}`,
            ...parsed.data,
            total: formatPrice(total),
            items: items.map((i) => `${i.quantity}× ${i.name}`).join(", "),
          }),
        });
      } catch {
        /* email is best-effort */
      }
      setDone(true);
      onComplete?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Checkout"
    >
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto border-2 border-ink bg-card">
        <div className="flex items-center justify-between border-b-2 border-ink px-5 py-4">
          <p className="font-display text-lg text-foreground">
            {done ? "Order received" : "Complete your order"}
          </p>
          <button type="button" onClick={onClose} aria-label="Close checkout">
            <X size={20} />
          </button>
        </div>

        {done ? (
          <div className="space-y-4 p-6 text-center">
            <CheckCircle2 className="mx-auto text-primary" size={44} />
            <p className="text-sm text-muted-foreground">
              Thanks — our team will contact you shortly to confirm payment, delivery and paperwork.
            </p>
            <button
              type="button"
              className="micro-label border-2 border-ink bg-primary px-5 py-3 text-primary-foreground"
              onClick={() => {
                onClose();
                navigate({ to: "/checkout/success" });
              }}
            >
              Continue
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 p-5">
            <ul className="border-2 border-ink">
              {items.map((i) => (
                <li
                  key={i.id}
                  className="flex items-center justify-between gap-3 border-b border-border px-3 py-2 text-sm last:border-b-0"
                >
                  <span className="text-foreground">
                    {i.quantity}× {i.name}
                  </span>
                  <span className="font-semibold text-primary">
                    {formatPrice(i.price * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="flex justify-between font-display text-lg text-foreground">
              <span>Total</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </p>

            <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />

            {(
              [
                ["customer_name", "Full name", "text"],
                ["email", "Email", "email"],
                ["phone", "Phone / WhatsApp", "tel"],
                ["address", "Delivery address", "text"],
              ] as const
            ).map(([name, label, type]) => (
              <div key={name}>
                <label htmlFor={`co-${name}`} className="micro-label mb-1 block text-muted-foreground">
                  {label}
                </label>
                <input
                  id={`co-${name}`}
                  name={name}
                  type={type}
                  required
                  className="w-full border-2 border-ink bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent"
                />
                {errors[name] && <p className="mt-1 text-xs text-destructive">{errors[name]}</p>}
              </div>
            ))}

            <div>
              <label htmlFor="co-notes" className="micro-label mb-1 block text-muted-foreground">
                Your message
              </label>
              <textarea
                id="co-notes"
                name="notes"
                rows={3}
                required
                placeholder="Anything we should know — trade-in, delivery timing, financing questions…"
                className="w-full border-2 border-ink bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent"
              />
              {errors.notes && <p className="mt-1 text-xs text-destructive">{errors.notes}</p>}
            </div>

            <button
              type="submit"
              disabled={busy}
              className="micro-label w-full border-2 border-ink bg-primary px-5 py-3 text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
            >
              {busy ? "Submitting…" : "Place order"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
