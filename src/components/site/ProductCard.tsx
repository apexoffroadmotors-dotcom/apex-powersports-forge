import { Link } from "@tanstack/react-router";
import { PlayCircle, Video } from "lucide-react";
import type { Product } from "@/lib/catalog.functions";
import { CONDITION_LABELS, TYPE_LABELS, formatPrice } from "@/lib/site";
import { PLACEHOLDER_IMAGE, productImageUrl, productVideoUrl } from "@/lib/images";

export function ProductCard({ product }: { product: Product }) {
  const hasImage = (product.images?.length ?? 0) > 0;
  const hasVideo = (product.videos?.length ?? 0) > 0;
  const img = productImageUrl(product.images?.[0]) || PLACEHOLDER_IMAGE;
  return (
    <article className="lift group flex h-full flex-col border-2 border-ink bg-card">
      <Link
        to="/shop/$slug"
        params={{ slug: product.slug }}
        className="relative block overflow-hidden border-b-2 border-ink"
      >
        {!hasImage && hasVideo ? (
          <>
            <video
              src={productVideoUrl(product.videos![0])}
              preload="metadata"
              muted
              className="aspect-[4/3] w-full bg-ink object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <PlayCircle
              size={36}
              className="absolute inset-0 m-auto text-white drop-shadow"
              aria-hidden
            />
          </>
        ) : (
          <img
            src={img}
            alt={`${product.name} — ${TYPE_LABELS[product.type] ?? "ATV"} for sale`}
            loading="lazy"
            className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {hasImage && hasVideo && (
          <span className="micro-label absolute bottom-2 right-2 flex items-center gap-1 border-2 border-ink bg-card px-2 py-1 text-foreground">
            <Video size={12} /> Video
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="micro-label text-muted-foreground">
            {TYPE_LABELS[product.type] ?? product.type}
          </span>
          <span className="micro-label border-2 border-ink bg-accent px-2 py-0.5 text-accent-foreground">
            {CONDITION_LABELS[product.condition] ?? product.condition}
          </span>
        </div>
        <h3 className="mt-2 font-display text-lg leading-tight text-foreground">
          <Link to="/shop/$slug" params={{ slug: product.slug }}>
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {[product.brand, product.model, product.year].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-auto flex items-end justify-between pt-4">
          <p className="font-display text-xl text-primary">{formatPrice(product.price)}</p>
          <Link
            to="/shop/$slug"
            params={{ slug: product.slug }}
            className="micro-label border-2 border-ink px-3 py-2 text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
