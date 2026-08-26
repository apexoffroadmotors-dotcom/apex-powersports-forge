import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/admin/products/new")({
  head: () => ({ meta: [{ title: `New product | ${SITE.name} admin` }] }),
  component: NewProduct,
});

function NewProduct() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/admin/products"
        className="micro-label inline-flex items-center gap-2 text-muted-foreground hover:text-primary"
      >
        <ArrowLeft size={14} /> Back to products
      </Link>
      <h1 className="mt-3 font-display text-2xl text-foreground">ADD A MACHINE</h1>
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}
