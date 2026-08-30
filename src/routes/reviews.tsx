import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { MessageSquareQuote } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { Stars } from "@/components/site/Stars";
import { listReviews } from "@/lib/catalog.functions";
import { JsonLd, seo } from "@/lib/seo";
import { SITE, whatsappHref } from "@/lib/site";

const reviewsQuery = queryOptions({
  queryKey: ["reviews-page"],
  queryFn: () => listReviews(),
});

export const Route = createFileRoute("/reviews")({
  head: () =>
    seo({
      title: "Customer Reviews | Apex Offroad Motors",
      description:
        "Real, verified reviews from Apex Offroad Motors customers — sport ATVs, utility quads, youth machines and side-by-sides, rated by the people who bought them.",
      path: "/reviews",
    }),
  loader: ({ context }) => context.queryClient.ensureQueryData(reviewsQuery),
  component: ReviewsPage,
});

function ReviewsPage() {
  const { data } = useSuspenseQuery(reviewsQuery);
  const [filter, setFilter] = useState<number | null>(null);
  const [visible, setVisible] = useState(18);


  const productMap = useMemo(
    () => new Map(data.products.map((p) => [p.id, p])),
    [data.products],
  );

  const avg =
    data.reviews.length > 0
      ? data.reviews.reduce((s, r) => s + r.rating, 0) / data.reviews.length
      : 0;

  const distribution = useMemo(() => {
    const counts = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: data.reviews.filter((r) => r.rating === star).length,
    }));
    const max = Math.max(1, ...counts.map((c) => c.count));
    return counts.map((c) => ({ ...c, pct: Math.round((c.count / max) * 100) }));
  }, [data.reviews]);

  const filtered = filter ? data.reviews.filter((r) => r.rating === filter) : data.reviews;

  return (
    <SiteLayout>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AutoDealer",
          name: SITE.name,
          url: SITE.url,
          ...(data.reviews.length > 0
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: avg.toFixed(1),
                  reviewCount: data.reviews.length,
                },
                review: data.reviews.slice(0, 20).map((r) => ({
                  "@type": "Review",
                  author: { "@type": "Person", name: r.author_name },
                  reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
                  reviewBody: r.body,
                })),
              }
            : {}),
        }}
      />

      <section className="border-b-2 border-ink bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="micro-label text-accent">Customer reviews</p>
          <h1 className="mt-3 font-display text-5xl leading-none sm:text-6xl">
            RIDERS, IN THEIR WORDS
          </h1>
          <p className="mt-4 max-w-xl text-sm text-primary-foreground/80">
            Every review below comes from a verified Apex Offroad Motors buyer. We publish the
            good and the constructive alike.
          </p>
        </div>
      </section>

      <section className="border-b-2 border-ink bg-secondary">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[auto_1fr]">
          <div className="flex flex-col items-start gap-2 md:items-center md:justify-center">
            <p className="font-display text-6xl text-foreground">{avg.toFixed(1)}</p>
            <Stars rating={avg} size={20} />
            <p className="micro-label text-muted-foreground">
              {data.reviews.length} verified {data.reviews.length === 1 ? "review" : "reviews"}
            </p>
          </div>
          <div className="flex flex-col justify-center gap-2">
            {distribution.map((d) => (
              <button
                key={d.star}
                type="button"
                onClick={() => setFilter(filter === d.star ? null : d.star)}
                className="flex items-center gap-3 text-left"
                aria-pressed={filter === d.star}
              >
                <span className="micro-label w-10 shrink-0 text-foreground">{d.star}★</span>
                <span className="h-3 flex-1 border border-ink bg-card">
                  <span
                    className={`block h-full ${filter === d.star ? "bg-primary" : "bg-accent"}`}
                    style={{ width: `${d.pct}%` }}
                  />
                </span>
                <span className="w-8 shrink-0 text-right text-xs text-muted-foreground">
                  {d.count}
                </span>
              </button>
            ))}
            {filter && (
              <button
                type="button"
                onClick={() => setFilter(null)}
                className="micro-label mt-1 self-start text-primary underline underline-offset-4"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        {filtered.length === 0 ? (
          <div className="border-2 border-dashed border-ink/30 p-14 text-center">
            <MessageSquareQuote className="mx-auto text-muted-foreground" size={28} />
            <h2 className="mt-4 font-display text-2xl text-foreground">No reviews at that rating</h2>
            <p className="mt-2 text-sm text-muted-foreground">Try a different filter.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-3">
              {filtered.slice(0, visible).map((r, i) => {
                const product = r.product_id ? productMap.get(r.product_id) : undefined;
                return (
                  <Reveal key={r.id} delay={Math.min(i % 12, 6) * 0.04}>
                    <figure className="flex h-full flex-col border-2 border-ink bg-card p-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            r.avatar_url ??
                            `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(r.author_name)}`
                          }
                          alt={`${r.author_name}, verified Apex Offroad Motors buyer`}
                          loading="lazy"
                          width={44}
                          height={44}
                          className="h-11 w-11 shrink-0 border-2 border-ink object-cover"
                        />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{r.author_name}</p>
                          <Stars rating={r.rating} size={14} />
                        </div>
                      </div>
                      <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
                        "{r.body}"
                      </blockquote>
                      <figcaption className="mt-6 flex items-center justify-between gap-2">
                        <span className="micro-label text-muted-foreground">Verified buyer</span>
                        {product && (
                          <Link
                            to="/shop/$slug"
                            params={{ slug: product.slug }}
                            className="micro-label text-primary hover:underline"
                          >
                            {product.name}
                          </Link>
                        )}
                      </figcaption>
                    </figure>
                  </Reveal>
                );
              })}
            </div>
            {visible < filtered.length && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + 18)}
                  className="micro-label border-2 border-ink bg-card px-6 py-3 text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  Load more reviews ({filtered.length - visible} left)
                </button>
              </div>
            )}
          </>
        )}

      </section>

      <section className="border-t-2 border-ink bg-surface text-surface-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-14 sm:px-6">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">Bought a machine from us?</h2>
            <p className="mt-3 max-w-lg text-sm text-surface-foreground/75">
              We'd love to publish your review. Send us a few lines and a rating, and our team
              will add it here.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={whatsappHref("Hi Apex Offroad, I'd like to leave a review of my machine.")}
              target="_blank"
              rel="noopener noreferrer"
              className="micro-label border-2 border-ink bg-accent px-5 py-3 text-accent-foreground"
            >
              Send on WhatsApp
            </a>
            <Link
              to="/contact"
              className="micro-label border-2 border-accent px-5 py-3 text-surface-foreground"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
