import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { NewsletterForm } from "@/components/site/Newsletter";
import { blogPosts } from "@/data/blogPosts";
import { JsonLd, seo } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/blog/")({
  validateSearch: (search: Record<string, unknown>): { category?: string } =>
    typeof search["category"] === "string" && search["category"]
      ? { category: search["category"] }
      : {},
  head: () =>
    seo({
      title: "The Journal | ATV Buying Guides, Maintenance & Riding Tips",
      description:
        "Practical ATV and side-by-side advice from Apex Offroad Motors: buying guides, maintenance schedules, financing breakdowns, gear reviews and trail etiquette.",
      path: "/blog",
    }),
  component: BlogIndex,
});

function BlogIndex() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const categories = useMemo(
    () => Array.from(new Set(blogPosts.map((p) => p.category))).sort(),
    [],
  );
  const [featured, ...rest] = blogPosts;
  if (!featured) return null;
  const filtered = search.category
    ? blogPosts.filter((p) => p.category === search.category)
    : rest;

  return (
    <SiteLayout>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: `${SITE.name} Journal`,
          url: `${SITE.url}/blog`,
          blogPost: blogPosts.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: `${SITE.url}/blog/${p.slug}`,
            datePublished: p.date,
            author: { "@type": "Organization", name: p.author },
          })),
        }}
      />

      <section className="border-b-2 border-ink bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="micro-label text-accent">The journal</p>
          <h1 className="mt-3 font-display text-5xl leading-none sm:text-6xl">
            RIDE SMARTER, NOT JUST HARDER
          </h1>
          <p className="mt-4 max-w-xl text-sm text-primary-foreground/80">
            Buying guides, maintenance schedules and trail knowledge from our own technicians and
            sales floor — written to actually help you decide, not to sell you something.
          </p>
        </div>
      </section>

      <section className="border-b-2 border-ink bg-secondary">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-5 sm:px-6">
          <button
            type="button"
            onClick={() => navigate({ search: {} })}
            className={`micro-label border-2 border-ink px-4 py-2 transition-colors ${
              !search.category
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground hover:bg-accent"
            }`}
          >
            All articles
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => navigate({ search: { category: c } })}
              className={`micro-label border-2 border-ink px-4 py-2 transition-colors ${
                search.category === c
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:bg-accent"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {!search.category && (
        <section className="border-b-2 border-ink">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
            <Link
              to="/blog/$slug"
              params={{ slug: featured.slug }}
              className="lift grid gap-0 border-2 border-ink bg-card md:grid-cols-2"
            >
              <img
                src={featured.image}
                alt={featured.title}
                className="h-full min-h-[260px] w-full border-b-2 border-ink object-cover md:border-b-0 md:border-r-2"
              />
              <div className="flex flex-col justify-center p-6 sm:p-8">
                <p className="micro-label text-primary">{featured.category} · Featured</p>
                <h2 className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl">
                  {featured.title}
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">{featured.excerpt}</p>
                <p className="micro-label mt-6 inline-flex items-center gap-2 text-primary">
                  Read the guide <ArrowRight size={14} />
                </p>
              </div>
            </Link>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        {filtered.length === 0 ? (
          <p className="border-2 border-dashed border-ink/30 p-14 text-center text-sm text-muted-foreground">
            No articles in this category yet. Check back soon.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post, i) => (
              <Reveal key={post.slug} delay={Math.min(i, 6) * 0.04}>
                <article className="lift flex h-full flex-col border-2 border-ink bg-card">
                  <Link to="/blog/$slug" params={{ slug: post.slug }} className="border-b-2 border-ink">
                    <img
                      src={post.image}
                      alt={post.title}
                      loading="lazy"
                      className="aspect-[16/10] w-full object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="micro-label text-primary">{post.category}</p>
                    <h3 className="mt-2 font-display text-lg leading-tight text-foreground">
                      <Link to="/blog/$slug" params={{ slug: post.slug }}>
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-2 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
                    <p className="micro-label mt-5 text-muted-foreground">
                      {post.readMinutes} min read ·{" "}
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <section className="border-t-2 border-ink bg-surface text-surface-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">New guides, first look</h2>
            <p className="mt-3 text-sm text-surface-foreground/75">
              One email whenever we publish a new buying guide or maintenance breakdown. No spam.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </SiteLayout>
  );
}
