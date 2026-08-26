import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { NewsletterForm } from "@/components/site/Newsletter";
import { blogPosts, getPost } from "@/data/blogPosts";
import { JsonLd, seo } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Article unavailable | Apex Offroad Motors" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    return seo({
      title: `${loaderData.title} | Apex Offroad Motors Journal`,
      description: loaderData.excerpt,
      path: `/blog/${params.slug}`,
      type: "article",
      image: loaderData.image,
    });
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl text-foreground">That article moved</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          It may have been renamed or retired. Browse the full journal instead.
        </p>
        <Link
          to="/blog"
          className="micro-label mt-8 inline-block border-2 border-ink bg-primary px-6 py-4 text-primary-foreground"
        >
          Back to the journal
        </Link>
      </div>
    </SiteLayout>
  ),
  component: BlogPost,
});

function BlogPost() {
  const post = Route.useLoaderData();
  const related = blogPosts.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3);
  const fallback = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const relatedPosts = related.length > 0 ? related : fallback;

  return (
    <SiteLayout>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          image: post.image,
          datePublished: post.date,
          author: { "@type": "Organization", name: post.author, url: SITE.url },
          publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
          mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
        }}
      />

      <nav aria-label="Breadcrumb" className="border-b-2 border-ink bg-secondary">
        <ol className="mx-auto flex max-w-3xl gap-2 px-4 py-3 text-xs text-muted-foreground sm:px-6">
          <li>
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link to="/blog" className="hover:text-primary">
              Journal
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="truncate text-foreground">{post.title}</li>
        </ol>
      </nav>

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="micro-label text-primary">{post.category}</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-foreground sm:text-5xl">
          {post.title}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User size={14} /> {post.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {new Date(post.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} /> {post.readMinutes} min read
          </span>
        </div>

        <img
          src={post.image}
          alt={post.title}
          className="mt-8 aspect-[16/9] w-full border-2 border-ink object-cover"
        />

        <div className="prose-apex mt-10 space-y-5">
          {post.body.map((paragraph, i) => (
            <p key={i} className="text-base leading-relaxed text-foreground/90">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-12 border-2 border-ink bg-secondary p-6">
          <p className="micro-label text-muted-foreground">Written by</p>
          <p className="mt-1 font-display text-lg text-foreground">{post.author}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Our sales and service team writes every guide from direct experience inspecting,
            selling and riding these machines — not from spec sheets.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/blog"
            className="micro-label inline-flex items-center gap-2 border-2 border-ink px-5 py-3 text-foreground transition-colors hover:bg-accent"
          >
            <ArrowLeft size={14} /> All articles
          </Link>
          <Link
            to="/shop"
            className="micro-label inline-flex items-center gap-2 border-2 border-ink bg-primary px-5 py-3 text-primary-foreground"
          >
            Browse inventory
          </Link>
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <section className="border-t-2 border-ink bg-secondary/60">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
            <h2 className="font-display text-3xl text-foreground">Keep reading</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {relatedPosts.map((p) => (
                <article key={p.slug} className="lift flex h-full flex-col border-2 border-ink bg-card">
                  <Link to="/blog/$slug" params={{ slug: p.slug }} className="border-b-2 border-ink">
                    <img
                      src={p.image}
                      alt={p.title}
                      loading="lazy"
                      className="aspect-[16/10] w-full object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="micro-label text-primary">{p.category}</p>
                    <h3 className="mt-2 font-display text-lg leading-tight text-foreground">
                      <Link to="/blog/$slug" params={{ slug: p.slug }}>
                        {p.title}
                      </Link>
                    </h3>
                    <p className="micro-label mt-5 text-muted-foreground">{p.readMinutes} min read</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t-2 border-ink bg-surface text-surface-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">New guides, first look</h2>
            <p className="mt-3 text-sm text-surface-foreground/75">
              One email whenever we publish a new buying guide or maintenance breakdown.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </SiteLayout>
  );
}
