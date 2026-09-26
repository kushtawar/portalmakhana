"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product, ProductAttribute, ProductVariant } from "@/lib/types";

const CATEGORIES = ["roasted", "flavoured", "raw", "gift-pack", "spice"] as const;

type FormVariant = ProductVariant;
type FormAttribute = ProductAttribute;

function emptyVariant(): FormVariant {
  return { id: `v${Date.now()}`, label: "", price: 0, sku: "", stock: 0 };
}

function emptyAttribute(): FormAttribute {
  return { label: "", value: "" };
}

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? "");
  const [longDescription, setLongDescription] = useState(product?.longDescription ?? "");
  const [category, setCategory] = useState<Product["category"]>(product?.category ?? "roasted");
  const [grade, setGrade] = useState(product?.grade ?? "");
  const [flavour, setFlavour] = useState(product?.flavour ?? "");
  const [gstRate, setGstRate] = useState(product?.gstRate ?? 5);
  const [priceIncludesTax, setPriceIncludesTax] = useState(product?.priceIncludesTax ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [bestseller, setBestseller] = useState(product?.bestseller ?? false);
  const [active, setActive] = useState(product?.active ?? true);
  const [variants, setVariants] = useState<FormVariant[]>(
    product?.variants && product.variants.length > 0 ? product.variants : [emptyVariant()]
  );
  const [attributes, setAttributes] = useState<FormAttribute[]>(product?.attributes ?? []);
  const [imagePath, setImagePath] = useState(product?.imagePath ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const updateVariant = (index: number, patch: Partial<FormVariant>) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  };

  const updateAttribute = (index: number, patch: Partial<FormAttribute>) => {
    setAttributes((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  };

  const handleImageUpload = async (file: File) => {
    setUploadError(null);
    setUploading(true);

    const body = new FormData();
    body.append("file", file);
    body.append("folder", "products");

    try {
      const res = await fetch("/api/media/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setImagePath(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      name,
      slug,
      shortDescription,
      longDescription,
      category,
      grade: grade || undefined,
      flavour: flavour || undefined,
      gstRate: Number(gstRate),
      priceIncludesTax,
      variants: variants.map((v) => ({
        ...v,
        price: Number(v.price),
        stock: Number(v.stock),
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
      })),
      imageLabels: product?.imageLabels ?? [name],
      // Sent as "" (not undefined) on removal so the PATCH actually clears it.
      imagePath,
      featured,
      bestseller,
      active,
      attributes: attributes.filter((a) => a.label && a.value),
    };

    const url = isEdit ? `/api/products/${product!.slug}` : "/api/products";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(
        typeof data.error === "string"
          ? data.error
          : "Could not save product. Check the fields and try again."
      );
      return;
    }

    router.push("/admin/products");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 rounded-xl border border-border bg-card p-6 sm:grid-cols-2">
        <label className="text-sm text-foreground-muted sm:col-span-2">
          Name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="text-sm text-foreground-muted">
          Slug
          <input
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            disabled={isEdit}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:bg-muted"
          />
        </label>
        <label className="text-sm text-foreground-muted">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Product["category"])}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-foreground-muted">
          Grade
          <input
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="text-sm text-foreground-muted">
          Flavour
          <input
            value={flavour}
            onChange={(e) => setFlavour(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="text-sm text-foreground-muted sm:col-span-2">
          Short description
          <input
            required
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="text-sm text-foreground-muted sm:col-span-2">
          Long description
          <textarea
            required
            rows={3}
            value={longDescription}
            onChange={(e) => setLongDescription(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="text-sm text-foreground-muted sm:col-span-2">
          Product image
          <div className="mt-1 flex flex-col gap-4 rounded-xl border border-dashed border-border bg-muted/40 p-4 sm:flex-row sm:items-center">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg border border-border bg-card">
              {imagePath ? (
                <Image src={imagePath} alt="Product preview" fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-foreground-muted">
                  No image yet
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleImageUpload(file);
                }}
                className="block w-full cursor-pointer text-sm text-foreground-muted file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              />
              <p className="mt-2 text-xs text-foreground-muted">
                JPEG, PNG or WebP, up to 5MB. Choosing a new file replaces the current image.
              </p>
              {uploading ? <p className="mt-1 text-xs text-primary">Uploading...</p> : null}
              {uploadError ? <p className="mt-1 text-xs text-danger">{uploadError}</p> : null}
              {imagePath ? (
                <button
                  type="button"
                  onClick={() => setImagePath("")}
                  className="mt-1 text-xs font-medium text-danger underline"
                >
                  Remove image
                </button>
              ) : null}
            </div>
          </div>
        </label>
        <label className="text-sm text-foreground-muted">
          GST rate (%)
          <input
            required
            type="number"
            min={0}
            max={100}
            value={gstRate}
            onChange={(e) => setGstRate(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <div className="flex flex-col justify-end gap-2 text-sm text-foreground-muted">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={priceIncludesTax}
              onChange={(e) => setPriceIncludesTax(e.target.checked)}
            />
            Price includes GST
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Featured
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={bestseller}
              onChange={(e) => setBestseller(e.target.checked)}
            />
            Bestseller
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Active
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Variants</p>
          <button
            type="button"
            onClick={() => setVariants((prev) => [...prev, emptyVariant()])}
            className="text-xs font-medium text-primary hover:underline"
          >
            + Add variant
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {variants.map((variant, index) => (
            <div key={variant.id} className="grid grid-cols-2 gap-3 rounded-lg border border-border p-3 sm:grid-cols-6">
              <input
                required
                placeholder="Label (e.g. 100g)"
                value={variant.label}
                onChange={(e) => updateVariant(index, { label: e.target.value })}
                className="rounded-lg border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
              />
              <input
                required
                type="number"
                min={0}
                placeholder="Price"
                value={variant.price}
                onChange={(e) => updateVariant(index, { price: Number(e.target.value) })}
                className="rounded-lg border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
              />
              <input
                required
                placeholder="SKU"
                value={variant.sku}
                onChange={(e) => updateVariant(index, { sku: e.target.value })}
                className="rounded-lg border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
              />
              <input
                required
                type="number"
                min={0}
                placeholder="Stock"
                value={variant.stock}
                onChange={(e) => updateVariant(index, { stock: Number(e.target.value) })}
                className="rounded-lg border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
              />
              <input
                type="number"
                min={0}
                placeholder="Low-stock at"
                value={variant.lowStockThreshold ?? 10}
                onChange={(e) =>
                  updateVariant(index, { lowStockThreshold: Number(e.target.value) })
                }
                className="rounded-lg border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                disabled={variants.length === 1}
                onClick={() => setVariants((prev) => prev.filter((_, i) => i !== index))}
                className="text-xs font-medium text-danger hover:underline disabled:opacity-40"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Attributes</p>
          <button
            type="button"
            onClick={() => setAttributes((prev) => [...prev, emptyAttribute()])}
            className="text-xs font-medium text-primary hover:underline"
          >
            + Add attribute
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {attributes.map((attribute, index) => (
            <div key={index} className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <input
                placeholder="Label (e.g. Shelf life)"
                value={attribute.label}
                onChange={(e) => updateAttribute(index, { label: e.target.value })}
                className="rounded-lg border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none sm:col-span-2"
              />
              <input
                placeholder="Value"
                value={attribute.value}
                onChange={(e) => updateAttribute(index, { value: e.target.value })}
                className="rounded-lg border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none sm:col-span-2"
              />
              <button
                type="button"
                onClick={() => setAttributes((prev) => prev.filter((_, i) => i !== index))}
                className="text-xs font-medium text-danger hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <button
        type="submit"
        disabled={saving || uploading}
        className="rounded-full bg-gradient-to-r from-primary to-primary-deep px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Saving..." : isEdit ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}
