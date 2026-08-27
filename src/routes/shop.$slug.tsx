import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Check, ShoppingCart, Truck } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { Stars } from "@/components/site/Stars";
import { getProductBySlug } from "@/lib/catalog.functions";
import { JsonLd, seo } from "@/lib/seo";
import { PLACEHOLDER_IMAGE, productImageUrl } from "@/lib/images";
import { CONDITION_LABELS, SITE, STATUS_LABELS, TYPE_LABELS, formatPrice, whatsappHref } from "@/lib/site";
import { useCart } from "@/context/CartContext";

const detailQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/shop/$slug")({
  loader: async ({ context, params }) => {
    const res = await context.queryClient.ensureQueryData(detailQuery(params.slug));
    if (!res.product) throw notFound();
    return res;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData?.product) {
      return {
        meta: [{ title: "Machine unavailable | Apex Offroad Motors" }, { name: "robots", content: "noindex" }],
      };
    }
    const p = loaderData.product;
    return seo({
      title: `${p.name} for Sale | ${formatPrice(p.price)} | Apex Offroad Motors`,
      description: (p.description ?? "").slice(0, 155) || `${p.name} available now at Apex Offroad Motors.`,
      path: `/shop/${params.slug}`,
      type: "product",
      ...(p.images?.[0]?.startsWith("http") ? { image: p.images[0] } : {}),
    });
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl text-foreground">That machine is gone</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          It may have sold. Browse what's currently on the floor.
        </p>
        <Link to="/shop" className="micro-label mt-8 inline-block border-2 border-ink bg-primary px-6 py-4 text-primary-foreground">
          Back to inventory
        </Link>
      </div>
    </SiteLayout>
  ),
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(detailQuery(slug));
  const product = data.product!;
  const { add } = useCart();
  const [active, setActive] = useState(0);

  const images = (product.images ?? []).map((i) => productImageUrl(i)).filter(Boolean);
  const hero = images[active] || PLACEHOLDER_IMAGE;
  const avg =
    data.reviews.length > 0
      ? data.reviews.reduce((s, r) => s + r.rating, 0) / data.reviews.length
      : null;
  const soldOut = product.listing_status !== "available";

  const features: string[] =
    product.specs && typeof product.specs === "object" && !Array.isArray(product.specs)
      ? Object.entries(product.specs as Record<string, unknown>).map(([k, v]) => `${k}: ${String(v)}`)
      : [];

  const specs: Array<[string, string]> = [
    ["Type", TYPE_LABELS[product.type] ?? product.type],
    ["Condition", CONDITION_LABELS[product.condition] ?? product.condition],
    ["Brand", product.brand ?? "—"],
    ["Model", product.model ?? "—"],
    ["Year", product.year ? String(product.year) : "—"],
    ["Engine", product.engine_size ?? "—"],
    ["Transmission", product.transmission ?? "—"],
    ["Mileage", product.mileage != null ? `${product.mileage} mi` : "—"],
    ["Availability", STATUS_LABELS[product.listing_status] ?? product.listing_status],
  ];

  return (
    <SiteLayout>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description ?? "",
          brand: { "@type": "Brand", name: product.brand ?? SITE.name },
          sku: product.slug,
          offers: {
            "@type": "Offer",
            price: Number(product.price),
            priceCurrency: "USD",
            availability: soldOut
              ? "https://schema.org/SoldOut"
              : "https://schema.org/InStock",
            url: `${SITE.url}/shop/${product.slug}`,
          },
          ...(avg
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: avg.toFixed(1),
                  reviewCount: data.reviews.length,
                },
              }
            : {}),
        }}
      />

      <nav aria-label="Breadcrumb" className="border-b-2 border-ink bg-secondary">
        <ol className="mx-auto flex max-w-7xl gap-2 px-4 py-3 text-xs text-muted-foreground sm:px-6">
          <li>
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link to="/shop" className="hover:text-primary">
              Inventory
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground">{product.name}</li>
        </ol>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2">
        <div>
          <img
            src={hero}
            alt={`${product.name} — ${TYPE_LABELS[product.type] ?? "ATV"} for sale`}
            className="w-full border-2 border-ink object-cover"
          />
          {images.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`h-20 w-24 border-2 ${i === active ? "border-accent" : "border-ink"}`}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="micro-label border-2 border-ink bg-accent px-2 py-1 text-accent-foreground">
              {CONDITION_LABELS[product.condition] ?? product.condition}
            </span>
            <span className="micro-label border-2 border-ink px-2 py-1 text-foreground">
              {TYPE_LABELS[product.type] ?? product.type}
            </span>
            {soldOut && (
              <span className="micro-label border-2 border-ink bg-destructive px-2 py-1 text-destructive-foreground">
                {STATUS_LABELS[product.listing_status]}
              </span>
            )}
          </div>
          <h1 className="mt-4 font-display text-4xl leading-tight text-foreground sm:text-5xl">
            {product.name}
          </h1>
          {avg && (
            <div className="mt-3 flex items-center gap-2">
              <Stars rating={avg} />
              <span className="text-sm text-muted-foreground">
                {avg.toFixed(1)} · {data.reviews.length} reviews
              </span>
            </div>
          )}
          <p className="mt-5 font-display text-4xl text-primary">{formatPrice(product.price)}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={soldOut}
              onClick={() => {
                add({
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: Number(product.price),
                  image: product.images?.[0] ?? null,
                });
                toast.success("Added to cart");
              }}
              className="micro-label inline-flex items-center gap-2 border-2 border-ink bg-primary px-6 py-4 text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart size={16} /> {soldOut ? "Unavailable" : "Add to cart"}
            </button>
            <a
              href={whatsappHref(`Hi, I'm interested in the ${product.name}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="micro-label inline-flex items-center gap-2 border-2 border-ink px-6 py-4 text-foreground transition-colors hover:bg-accent"
            >
              Ask about this unit
            </a>
          </div>

          <p className="micro-label mt-5 flex items-center gap-2 text-muted-foreground">
            <Truck size={16} /> Enclosed delivery available nationwide
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-px border-2 border-ink bg-border">
            {specs.map(([k, v]) => (
              <div key={k} className="bg-card px-4 py-3">
                <dt className="micro-label text-muted-foreground">{k}</dt>
                <dd className="mt-1 text-sm text-foreground">{v}</dd>
              </div>
            ))}
          </dl>

          {features.length > 0 && (
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                  <Check size={16} className="mt-0.5 shrink-0 text-primary" /> {f}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {data.reviews.length > 0 && (
        <section className="border-t-2 border-ink bg-secondary/60">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
            <h2 className="font-display text-3xl text-foreground">Owner reviews</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {data.reviews.map((r) => (
                <figure key={r.id} className="border-2 border-ink bg-card p-6">
                  <Stars rating={r.rating} size={16} />
                  <blockquote className="mt-3 text-sm text-foreground">"{r.body}"</blockquote>
                  <figcaption className="micro-label mt-5 text-muted-foreground">
                    {r.author_name}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {data.related.length > 0 && (
        <section className="border-t-2 border-ink">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
            <h2 className="font-display text-3xl text-foreground">Similar machines</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
