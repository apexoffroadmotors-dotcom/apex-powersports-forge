import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { seo } from "@/lib/seo";
import { formatPrice, whatsappHref } from "@/lib/site";

export const Route = createFileRoute("/financing")({
  head: () =>
    seo({
      title: "ATV Financing & Monthly Payment Calculator | Apex Offroad",
      description:
        "Estimate monthly payments on any ATV or side-by-side, see what lenders look for and get pre-qualified in under 24 hours with Apex Offroad Motors.",
      path: "/financing",
    }),
  component: FinancingPage,
});

const FAQ = [
  {
    q: "What credit score do I need?",
    a: "Most powersports lenders approve from the mid-600s, and we work with subprime programs down to the high 500s with a larger down payment.",
  },
  {
    q: "How much should I put down?",
    a: "Ten to twenty percent keeps payments comfortable and improves approval odds. Zero-down programs exist on new units with strong credit.",
  },
  {
    q: "Does applying hurt my credit?",
    a: "Pre-qualification uses a soft pull. Only the final application, once you pick a machine, results in a hard inquiry.",
  },
];

function FinancingPage() {
  const [price, setPrice] = useState(12500);
  const [down, setDown] = useState(1500);
  const [apr, setApr] = useState(8.9);
  const [months, setMonths] = useState(48);

  const { monthly, totalInterest } = useMemo(() => {
    const principal = Math.max(0, price - down);
    const r = apr / 100 / 12;
    const m = r === 0 ? principal / months : (principal * r) / (1 - Math.pow(1 + r, -months));
    return { monthly: m, totalInterest: m * months - principal };
  }, [price, down, apr, months]);

  return (
    <SiteLayout>
      <section className="border-b-2 border-ink bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="micro-label text-accent">Financing</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl">RIDE NOW, PAY MONTHLY</h1>
          <p className="mt-4 max-w-prose text-sm text-primary-foreground/80">
            Run the numbers yourself before you talk to anyone. Estimates only — your final terms come
            from the lender.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="border-2 border-ink bg-card p-6">
          <h2 className="font-display text-2xl text-foreground">Payment calculator</h2>
          <div className="mt-6 space-y-6">
            {(
              [
                ["Machine price", price, setPrice, 1500, 60000, 250, formatPrice(price)],
                ["Down payment", down, setDown, 0, 20000, 100, formatPrice(down)],
                ["APR", apr, setApr, 0, 24, 0.1, `${apr.toFixed(1)}%`],
                ["Term", months, setMonths, 12, 84, 6, `${months} months`],
              ] as const
            ).map(([label, value, setter, min, max, step, display]) => (
              <div key={label}>
                <div className="flex items-center justify-between">
                  <label className="micro-label text-muted-foreground" htmlFor={`f-${label}`}>
                    {label}
                  </label>
                  <span className="font-display text-sm text-foreground">{display}</span>
                </div>
                <input
                  id={`f-${label}`}
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={(e) => (setter as (v: number) => void)(Number(e.target.value))}
                  className="mt-2 w-full accent-primary"
                />
              </div>
            ))}
          </div>
        </div>

        <aside className="h-fit border-2 border-ink bg-surface p-6 text-surface-foreground">
          <p className="micro-label text-accent">Estimated payment</p>
          <p className="mt-3 font-display text-5xl">{formatPrice(monthly)}</p>
          <p className="micro-label mt-1 text-surface-foreground/70">per month</p>
          <dl className="mt-6 space-y-2 border-t border-accent/30 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-surface-foreground/70">Amount financed</dt>
              <dd>{formatPrice(Math.max(0, price - down))}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-surface-foreground/70">Total interest</dt>
              <dd>{formatPrice(totalInterest)}</dd>
            </div>
          </dl>
          <a
            href={whatsappHref(
              `Hi Apex Offroad, I'd like to get pre-qualified. Budget around ${formatPrice(monthly)}/month.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="micro-label mt-6 block border-2 border-ink bg-accent px-5 py-3 text-center text-accent-foreground"
          >
            Get pre-qualified
          </a>
          <Link
            to="/contact"
            className="micro-label mt-2 block border-2 border-accent px-5 py-3 text-center"
          >
            Ask a question
          </Link>
        </aside>
      </div>

      <section className="border-t-2 border-ink bg-background">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <h2 className="font-display text-3xl text-foreground">FINANCING QUESTIONS</h2>
          <div className="mt-6 divide-y-2 divide-ink border-2 border-ink bg-card">
            {FAQ.map((f) => (
              <details key={f.q} className="p-4">
                <summary className="cursor-pointer font-display text-base text-foreground">
                  {f.q}
                </summary>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
