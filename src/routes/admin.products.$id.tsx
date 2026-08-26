import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

export const Route = createFileRoute("/admin/products/$id")({
  head: () => ({ meta: [{ title: `Edit product | ${SITE.name} admin` }] }),
  component: EditProduct,
});

function EditProduct() {
  const { id } = Route.useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (cancelled) return;
      setProduct((data as Product | null) ?? null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/admin/products"
        className="micro-label inline-flex items-center gap-2 text-muted-foreground hover:text-primary"
      >
        <ArrowLeft size={14} /> Back to products
      </Link>
      <h1 className="mt-3 font-display text-2xl text-foreground">
        {product ? product.name.toUpperCase() : "EDIT PRODUCT"}
      </h1>
      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : product ? (
          <ProductForm product={product} />
        ) : (
          <p className="text-sm text-muted-foreground">Product not found.</p>
        )}
      </div>
    </div>
  );
}
