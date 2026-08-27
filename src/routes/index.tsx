import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Gauge,
  MapPin,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { ProductCard } from "@/components/site/ProductCard";
import { Stars } from "@/components/site/Stars";
import { NewsletterForm } from "@/components/site/Newsletter";
import { Typewriter } from "@/components/site/Typewriter";
import { listProducts, listReviews } from "@/lib/catalog.functions";
import { JsonLd, organizationSchema, seo } from "@/lib/seo";
import { SITE, TYPE_LABELS } from "@/lib/site";
import { blogPosts } from "@/data/blogPosts";
import hero from "@/assets/hero-atv.jpg";
import showroom from "@/assets/showroom.jpg";

const homeQuery = queryOptions({
  queryKey: ["home-data"],
  queryFn: async () => {
    const [p, r] = await Promise.all([listProducts(), listReviews()]);
    return { products: p.products, reviews: r.reviews };
  },
});

export const Route = createFileRoute("/")({
  head: () =>
    seo({
      title: "Apex Offroad Motors | Premium ATVs & Side-by-Sides for Sale",
      description:
        "Shop hand-inspected sport, utility and youth ATVs plus side-by-sides. Nationwide shipping, powersports financing and a 121-point pre-delivery inspection.",
      path: "/",
    }),
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  component: Home,
});

const STATS = [
  { value: "121", label: "Point inspection" },
  { value: "48h", label: "Average dispatch" },
  { value: "50", label: "States shipped" },
  { value: "4.9", label: "Average rating" },
];

const CATEGORIES = [
  { key: "sport", copy: "Low, light and built to be ridden hard on dunes and open desert." },
  { key: "utility", copy: "Torque, racks and locking 4WD for work that starts before sunrise." },
  { key: "side_by_side", copy: "Cages, harnesses and a real cargo bed for riding with people." },
  { key: "youth", copy: "Speed-limited, tethered and sized properly for smaller riders." },
];

const PROCESS = [
  { n: "01", t: "Pick the machine", d: "Browse live inventory with real photos, hours and history." },
  { n: "02", t: "Lock the price", d: "Reserve online or message us. No hidden dealer add-ons." },
  { n: "03", t: "Inspection & prep", d: "121-point check, fluids, tires and a full function test." },
  { n: "04", t: "Delivered", d: "Enclosed transport to your driveway, or pick up at the shop." },
];

function Home() {
  const { data } = useSuspenseQuery(homeQuery);
  const featured = data.products.slice(0, 6);
  const reviews = data.reviews.slice(0, 3);
  const avg =
    data.reviews.length > 0
      ? data.reviews.reduce((s, r) => s + r.rating, 0) / data.reviews.length
      : 5;

  return (
    <SiteLayout>
      <JsonLd data={organizationSchema} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE.name,
          url: SITE.url,
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE.url}/shop?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />

      {/* Hero */}
      <section className="relative border-b-2 border-ink bg-primary text-primary-foreground noise">
        <div className="mx-auto grid max-w-7xl gap-0 px-0 lg:grid-cols-12">
          <div className="flex flex-col justify-center px-4 py-16 sm:px-6 lg:col-span-6 lg:py-24">
            <p className="micro-label text-accent">Powersports dealership · {SITE.region}</p>
            <h1 className="mt-5 font-display text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
              MACHINES BUILT
              <br />
              FOR{" "}
              <span className="text-accent">
                <Typewriter words={["MUD.", "DUNES.", "ROCK.", "WORK."]} />
              </span>
            </h1>
            <p className="mt-6 max-w-md text-base text-primary-foreground/80">
              Apex Offroad Motors sources, inspects and ships premium ATVs and side-by-sides across
              the country. Every unit gets a 121-point inspection before it leaves the floor.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="micro-label inline-flex items-center gap-2 border-2 border-ink bg-accent px-6 py-4 text-accent-foreground transition-transform hover:-translate-y-0.5"
              >
                Browse inventory <ArrowRight size={16} />
              </Link>
              <Link
                to="/financing"
                className="micro-label inline-flex items-center gap-2 border-2 border-primary-foreground px-6 py-4 text-primary-foreground transition-colors hover:bg-primary-foreground hover:text-primary"
              >
                Check financing
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-3">
              <Stars rating={avg} />
              <span className="text-sm text-primary-foreground/70">
                {avg.toFixed(1)} from {data.reviews.length} verified owner reviews
              </span>
            </div>
          </div>
          <div className="relative border-t-2 border-ink lg:col-span-6 lg:border-l-2 lg:border-t-0">
            <img
              src={hero}
              alt="Sport ATV riding through a forest trail at Apex Offroad Motors"
              className="h-full min-h-[320px] w-full object-cover"
              fetchPriority="high"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 border-t-2 border-ink md:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="border-r-2 border-t-2 border-ink px-4 py-5 last:border-r-0 md:border-t-0"
            >
              <p className="font-display text-3xl text-accent">{s.value}</p>
              <p className="micro-label mt-1 text-primary-foreground/70">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b-2 border-ink bg-secondary">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-4 py-6 sm:px-6 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, t: "121-point inspection" },
            { icon: Truck, t: "Nationwide delivery" },
            { icon: Banknote, t: "Financing available" },
            { icon: Wrench, t: "In-house service" },
          ].map(({ icon: Icon, t }) => (
            <div key={t} className="flex items-center gap-3 px-2 py-2">
              <Icon size={20} className="text-primary" />
              <span className="micro-label text-foreground">{t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <Reveal>
            <p className="micro-label text-muted-foreground">Ride categories</p>
            <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight text-foreground sm:text-5xl">
              Four categories. Zero overlap.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((c, i) => (
              <Reveal key={c.key} delay={i * 0.06}>
                <Link
                  to="/shop"
                  search={{ type: c.key }}
                  className="lift flex h-full flex-col border-2 border-ink bg-card p-5"
                >
                  <Gauge size={22} className="text-primary" />
                  <h3 className="mt-4 font-display text-xl text-foreground">
                    {TYPE_LABELS[c.key]}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{c.copy}</p>
                  <span className="micro-label mt-6 inline-flex items-center gap-2 text-primary">
                    Shop <ArrowRight size={14} />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured inventory */}
      <section className="border-b-2 border-ink bg-secondary/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="micro-label text-muted-foreground">On the floor now</p>
              <h2 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">
                Featured machines
              </h2>
            </div>
            <Link
              to="/shop"
              className="micro-label inline-flex items-center gap-2 border-2 border-ink px-5 py-3 text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              All inventory <ArrowRight size={14} />
            </Link>
          </div>
          {featured.length === 0 ? (
            <p className="mt-10 border-2 border-dashed border-ink/30 p-10 text-center text-sm text-muted-foreground">
              Inventory is being restocked. Check back shortly or join the list below.
            </p>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.05}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Story split */}
      <section className="border-b-2 border-ink">
        <div className="mx-auto grid max-w-7xl gap-0 lg:grid-cols-2">
          <div className="border-b-2 border-ink lg:border-b-0 lg:border-r-2">
            <img
              src={showroom}
              alt="Apex Offroad Motors showroom floor with ATVs lined up"
              loading="lazy"
              className="h-full min-h-[300px] w-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center px-4 py-16 sm:px-8">
            <p className="micro-label text-muted-foreground">Why Apex</p>
            <h2 className="mt-3 font-display text-4xl leading-tight text-foreground sm:text-5xl">
              We buy machines the way we'd buy our own.
            </h2>
            <p className="mt-5 text-muted-foreground">
              Every unit is sourced by a technician, not a spreadsheet. We refuse anything with
              frame damage, water intrusion or a title we can't verify. What survives that filter
              gets fluids, tires, a battery test and a documented inspection sheet you receive with
              the machine.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Documented 121-point pre-delivery inspection",
                "Real photography — no manufacturer stock shots",
                "Transparent pricing, no forced accessory packages",
                "Enclosed nationwide transport with tracking",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-foreground">
                  <BadgeCheck size={18} className="mt-0.5 shrink-0 text-primary" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link
                to="/about"
                className="micro-label inline-flex items-center gap-2 border-2 border-ink bg-primary px-6 py-4 text-primary-foreground"
              >
                Our story <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="border-b-2 border-ink bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <p className="micro-label text-accent">How buying works</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">Four steps to the trailhead</h2>
          <div className="mt-10 grid gap-px border-2 border-primary-foreground/20 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((s) => (
              <div key={s.n} className="border border-primary-foreground/20 p-6">
                <p className="font-display text-4xl text-accent">{s.n}</p>
                <h3 className="mt-3 font-display text-xl">{s.t}</h3>
                <p className="mt-2 text-sm text-primary-foreground/75">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="border-b-2 border-ink">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="micro-label text-muted-foreground">Owner feedback</p>
              <h2 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">
                Riders, in their words
              </h2>
            </div>
            <Link
              to="/reviews"
              className="micro-label inline-flex items-center gap-2 border-2 border-ink px-5 py-3 text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              All reviews <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {reviews.map((r, i) => (
              <Reveal key={r.id} delay={i * 0.06}>
                <figure className="flex h-full flex-col border-2 border-ink bg-card p-6">
                  <Stars rating={r.rating} size={16} />
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
                    "{r.body}"
                  </blockquote>
                  <figcaption className="micro-label mt-6 text-muted-foreground">
                    {r.author_name} · Verified buyer
                  </figcaption>
                </figure>
              </Reveal>
            ))}
            {reviews.length === 0 && (
              <p className="text-sm text-muted-foreground">Reviews coming soon.</p>
            )}
          </div>
        </div>
      </section>

      {/* Journal */}
      <section className="border-b-2 border-ink bg-secondary/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="micro-label text-muted-foreground">The journal</p>
              <h2 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">
                Guides worth reading before you buy
              </h2>
            </div>
            <Link
              to="/blog"
              className="micro-label inline-flex items-center gap-2 border-2 border-ink px-5 py-3 text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              All articles <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {blogPosts.slice(0, 3).map((post, i) => (
              <Reveal key={post.slug} delay={i * 0.06}>
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
                      {post.readMinutes} min read
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + newsletter */}
      <section className="border-b-2 border-ink">
        <div className="mx-auto grid max-w-7xl gap-0 lg:grid-cols-2">
          <div className="border-b-2 border-ink px-4 py-14 sm:px-8 lg:border-b-0 lg:border-r-2">
            <MapPin size={22} className="text-primary" />
            <h2 className="mt-4 font-display text-3xl text-foreground sm:text-4xl">
              Visit the shop or have it delivered
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Walk the floor, ride a demo unit, or let us crate and ship anywhere in the lower 48.
              Talk to a real technician before you commit.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="micro-label border-2 border-ink bg-primary px-6 py-4 text-primary-foreground"
              >
                Contact us
              </Link>
              <a
                href={`tel:${SITE.phone}`}
                className="micro-label border-2 border-ink px-6 py-4 text-foreground"
              >
                Call now
              </a>
            </div>
          </div>
          <div className="bg-surface px-4 py-14 text-surface-foreground sm:px-8">
            <h2 className="font-display text-3xl sm:text-4xl">New arrivals, first look</h2>
            <p className="mt-3 text-sm text-surface-foreground/75">
              One email when fresh inventory lands. No spam, unsubscribe anytime.
            </p>
            <div className="mt-6">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
