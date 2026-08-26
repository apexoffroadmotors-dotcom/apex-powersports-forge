import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { Reveal } from "@/components/site/Reveal";
import { listProducts } from "@/lib/catalog.functions";
import { JsonLd, seo } from "@/lib/seo";
import { CONDITION_LABELS, SITE, TYPE_LABELS } from "@/lib/site";

type ShopSearch = { q: string; type: string; condition: string; sort: string };

const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: () => listProducts(),
});

export const Route = createFileRoute("/shop/")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    q: typeof search["q"] === "string" ? search["q"].slice(0, 80) : "",
    type: typeof search["type"] === "string" ? search["type"] : "",
    condition: typeof search["condition"] === "string" ? search["condition"] : "",
    sort: typeof search["sort"] === "string" ? search["sort"] : "",
  }),
  head: () =>
    seo({
      title: "ATVs & Side-by-Sides for Sale | Apex Offroad Motors Inventory",
      description:
        "Browse live powersports inventory: sport ATVs, utility quads, youth machines and side-by-sides. Filter by type, condition and price with nationwide delivery.",
      path: "/shop",
    }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  component: Shop,
});

function Shop() {
  const { data } = useSuspenseQuery(productsQuery);
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop/" });

  const setSearch = (patch: Partial<ShopSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) });


  const filtered = useMemo(() => {
    let list = data.products;
    if (search.type) list = list.filter((p) => p.type === search.type);
    if (search.condition) list = list.filter((p) => p.condition === search.condition);
    if (search.q) {
      const q = search.q.toLowerCase();
      list = list.filter((p) =>
        [p.name, p.brand, p.model, p.description].join(" ").toLowerCase().includes(q),
      );
    }
    const sorted = [...list];
    if (search.sort === "price-asc") sorted.sort((a, b) => Number(a.price) - Number(b.price));
    if (search.sort === "price-desc") sorted.sort((a, b) => Number(b.price) - Number(a.price));
    if (search.sort === "year-desc") sorted.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    return sorted;
  }, [data.products, search]);

  return (
    <SiteLayout>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Apex Offroad Motors inventory",
          itemListElement: filtered.slice(0, 20).map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE.url}/shop/${p.slug}`,
            name: p.name,
          })),
        }}
      />
      <section className="border-b-2 border-ink bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="micro-label text-accent">Inventory</p>
          <h1 className="mt-3 font-display text-5xl leading-none sm:text-6xl">
            EVERY MACHINE ON THE FLOOR
          </h1>
          <p className="mt-4 max-w-xl text-sm text-primary-foreground/80">
            {data.products.length} units in stock. Inspected, photographed and priced without
            games.
          </p>
        </div>
      </section>

      <section className="border-b-2 border-ink bg-secondary">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-5 sm:px-6">
          <label className="flex flex-1 min-w-[220px] items-center gap-2 border-2 border-ink bg-card px-3 py-2.5">
            <Search size={16} className="text-muted-foreground" />
            <span className="sr-only">Search inventory</span>
            <input
              value={search.q ?? ""}
              onChange={(e) => setSearch({ q: e.target.value })}
              placeholder="Search brand, model or keyword"
              maxLength={80}
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <select
            value={search.type ?? ""}
            onChange={(e) => setSearch({ type: e.target.value })}
            className="border-2 border-ink bg-card px-3 py-2.5 text-sm"
            aria-label="Filter by type"
          >
            <option value="">All types</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select
            value={search.condition ?? ""}
            onChange={(e) => setSearch({ condition: e.target.value })}
            className="border-2 border-ink bg-card px-3 py-2.5 text-sm"
            aria-label="Filter by condition"
          >
            <option value="">Any condition</option>
            {Object.entries(CONDITION_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select
            value={search.sort ?? ""}
            onChange={(e) => setSearch({ sort: e.target.value })}
            className="border-2 border-ink bg-card px-3 py-2.5 text-sm"
            aria-label="Sort inventory"
          >
            <option value="">Newest first</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="year-desc">Model year</option>
          </select>
          <span className="micro-label flex items-center gap-2 text-muted-foreground">
            <SlidersHorizontal size={14} /> {filtered.length} results
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        {filtered.length === 0 ? (
          <div className="border-2 border-dashed border-ink/30 p-14 text-center">
            <h2 className="font-display text-2xl text-foreground">No machines match that</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try clearing filters, or tell us what you're hunting for and we'll source it.
            </p>
            <Link
              to="/contact"
              className="micro-label mt-6 inline-block border-2 border-ink bg-primary px-5 py-3 text-primary-foreground"
            >
              Request a machine
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i, 6) * 0.04}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
