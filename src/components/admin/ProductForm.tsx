import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { productImageUrl, PLACEHOLDER_IMAGE } from "@/lib/images";
import { CONDITION_LABELS, STATUS_LABELS, TYPE_LABELS } from "@/lib/site";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type AtvType = Database["public"]["Enums"]["atv_type"];
type AtvCondition = Database["public"]["Enums"]["atv_condition"];
type ListingStatus = Database["public"]["Enums"]["listing_status"];

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(160),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(160)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes"),
  brand: z.string().trim().max(80),
  model: z.string().trim().max(80),
  year: z.number().int().min(1970).max(2100).nullable(),
  price: z.number().min(0),
  mileage: z.number().int().min(0).nullable(),
  stock: z.number().int().min(0).max(9999),
  short_description: z.string().trim().max(300),
  description: z.string().trim().max(6000),
});

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);

const inputClass =
  "w-full border-2 border-ink bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary";
const labelClass = "micro-label mb-1 block text-muted-foreground";

export function ProductForm({ product }: { product?: Product }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    brand: product?.brand ?? "",
    model: product?.model ?? "",
    year: product?.year ? String(product.year) : "",
    type: (product?.type ?? "utility") as AtvType,
    condition: (product?.condition ?? "new") as AtvCondition,
    listing_status: (product?.listing_status ?? "available") as ListingStatus,
    price: product?.price ? String(product.price) : "",
    mileage: product?.mileage != null ? String(product.mileage) : "",
    engine_size: product?.engine_size ?? "",
    transmission: product?.transmission ?? "",
    color: product?.color ?? "",
    stock: product?.stock != null ? String(product.stock) : "1",
    is_available: product?.is_available ?? true,
    is_featured: product?.is_featured ?? false,
    short_description: product?.short_description ?? "",
    description: product?.description ?? "",
    specs: JSON.stringify(product?.specs ?? {}, null, 2),
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files).slice(0, 8)) {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `products/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from("product-images")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (error) {
          toast.error(`Upload failed: ${error.message}`);
          continue;
        }
        uploaded.push(path);
      }
      if (uploaded.length) setImages((prev) => [...prev, ...uploaded]);
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    let specs: Record<string, unknown> = {};
    try {
      specs = form.specs.trim() ? JSON.parse(form.specs) : {};
    } catch {
      setErrors({ specs: "Specs must be valid JSON" });
      return;
    }

    const parsed = schema.safeParse({
      name: form.name,
      slug: form.slug || slugify(form.name),
      brand: form.brand,
      model: form.model,
      year: form.year ? Number(form.year) : null,
      price: Number(form.price || 0),
      mileage: form.mileage ? Number(form.mileage) : null,
      stock: Number(form.stock || 0),
      short_description: form.short_description,
      description: form.description,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const payload = {
        ...parsed.data,
        type: form.type,
        condition: form.condition,
        listing_status: form.listing_status,
        engine_size: form.engine_size,
        transmission: form.transmission,
        color: form.color,
        is_available: form.is_available,
        is_featured: form.is_featured,
        specs,
        images,
      };
      const { error } = product
        ? await supabase.from("products").update(payload).eq("id", product.id)
        : await supabase.from("products").insert(payload);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(product ? "Product updated" : "Product created");
      navigate({ to: "/admin/products" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <section className="border-2 border-ink bg-card p-5">
          <h2 className="font-display text-lg text-foreground">Basics</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="p-name">
                Name
              </label>
              <input
                id="p-name"
                className={inputClass}
                value={form.name}
                onChange={(e) => {
                  set("name", e.target.value);
                  if (!product) set("slug", slugify(e.target.value));
                }}
              />
              {errors["name"] && <p className="mt-1 text-xs text-destructive">{errors["name"]}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="p-slug">
                URL slug
              </label>
              <input
                id="p-slug"
                className={inputClass}
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
              />
              {errors["slug"] && <p className="mt-1 text-xs text-destructive">{errors["slug"]}</p>}
            </div>
            <div>
              <label className={labelClass} htmlFor="p-brand">
                Brand
              </label>
              <input
                id="p-brand"
                className={inputClass}
                value={form.brand}
                onChange={(e) => set("brand", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="p-model">
                Model
              </label>
              <input
                id="p-model"
                className={inputClass}
                value={form.model}
                onChange={(e) => set("model", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="p-year">
                Year
              </label>
              <input
                id="p-year"
                inputMode="numeric"
                className={inputClass}
                value={form.year}
                onChange={(e) => set("year", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="p-color">
                Color
              </label>
              <input
                id="p-color"
                className={inputClass}
                value={form.color}
                onChange={(e) => set("color", e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="border-2 border-ink bg-card p-5">
          <h2 className="font-display text-lg text-foreground">Copy</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className={labelClass} htmlFor="p-short">
                Short description
              </label>
              <input
                id="p-short"
                className={inputClass}
                maxLength={300}
                value={form.short_description}
                onChange={(e) => set("short_description", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="p-desc">
                Full description
              </label>
              <textarea
                id="p-desc"
                rows={7}
                className={inputClass}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="p-specs">
                Specs (JSON key/value)
              </label>
              <textarea
                id="p-specs"
                rows={5}
                className={`${inputClass} font-mono text-xs`}
                value={form.specs}
                onChange={(e) => set("specs", e.target.value)}
              />
              {errors["specs"] && (
                <p className="mt-1 text-xs text-destructive">{errors["specs"]}</p>
              )}
            </div>
          </div>
        </section>

        <section className="border-2 border-ink bg-card p-5">
          <h2 className="font-display text-lg text-foreground">Photos</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((path) => (
              <div key={path} className="relative border-2 border-ink">
                <img
                  src={productImageUrl(path) || PLACEHOLDER_IMAGE}
                  alt="Product"
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => setImages((prev) => prev.filter((p) => p !== path))}
                  className="absolute right-1 top-1 border-2 border-ink bg-destructive p-1 text-destructive-foreground"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <label className="micro-label flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-ink text-muted-foreground">
              {uploading ? <Loader2 className="animate-spin" size={18} /> : <ImagePlus size={18} />}
              {uploading ? "Uploading" : "Add photo"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => handleUpload(e.target.files)}
              />
            </label>
          </div>
        </section>
      </div>

      <div className="space-y-5">
        <section className="border-2 border-ink bg-card p-5">
          <h2 className="font-display text-lg text-foreground">Listing</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className={labelClass} htmlFor="p-price">
                Price (USD)
              </label>
              <input
                id="p-price"
                inputMode="decimal"
                className={inputClass}
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
              />
              {errors["price"] && (
                <p className="mt-1 text-xs text-destructive">{errors["price"]}</p>
              )}
            </div>
            <div>
              <label className={labelClass} htmlFor="p-type">
                Type
              </label>
              <select
                id="p-type"
                className={inputClass}
                value={form.type}
                onChange={(e) => set("type", e.target.value as AtvType)}
              >
                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="p-condition">
                Condition
              </label>
              <select
                id="p-condition"
                className={inputClass}
                value={form.condition}
                onChange={(e) => set("condition", e.target.value as AtvCondition)}
              >
                {Object.entries(CONDITION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="p-status">
                Status
              </label>
              <select
                id="p-status"
                className={inputClass}
                value={form.listing_status}
                onChange={(e) => set("listing_status", e.target.value as ListingStatus)}
              >
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} htmlFor="p-stock">
                  Stock
                </label>
                <input
                  id="p-stock"
                  inputMode="numeric"
                  className={inputClass}
                  value={form.stock}
                  onChange={(e) => set("stock", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="p-mileage">
                  Mileage
                </label>
                <input
                  id="p-mileage"
                  inputMode="numeric"
                  className={inputClass}
                  value={form.mileage}
                  onChange={(e) => set("mileage", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} htmlFor="p-engine">
                  Engine
                </label>
                <input
                  id="p-engine"
                  className={inputClass}
                  value={form.engine_size}
                  onChange={(e) => set("engine_size", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="p-trans">
                  Transmission
                </label>
                <input
                  id="p-trans"
                  className={inputClass}
                  value={form.transmission}
                  onChange={(e) => set("transmission", e.target.value)}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.is_available}
                onChange={(e) => set("is_available", e.target.checked)}
              />
              Show on storefront
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => set("is_featured", e.target.checked)}
              />
              Feature on homepage
            </label>
          </div>
        </section>

        <button
          type="submit"
          disabled={busy}
          className="micro-label w-full border-2 border-ink bg-primary px-5 py-3 text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Saving…" : product ? "Save changes" : "Create product"}
        </button>
      </div>
    </form>
  );
}
