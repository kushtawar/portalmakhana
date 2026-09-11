"use client";

import { useMemo, useState } from "react";
import type { Product, ProductCategory } from "@/lib/types";
import ProductCard from "@/components/product/ProductCard";

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  roasted: "Roasted",
  flavoured: "Flavoured",
  raw: "Raw",
  "gift-pack": "Gift Packs",
  spice: "Spices",
};

export default function ShopGrid({ products }: { products: Product[] }) {
  const [category, setCategory] = useState<ProductCategory | "all">("all");

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category))),
    [products]
  );

  const filtered =
    category === "all"
      ? products
      : products.filter((product) => product.category === category);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            category === "all"
              ? "border-primary bg-primary-light text-primary-dark"
              : "border-border text-foreground-muted hover:bg-muted"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              category === cat
                ? "border-primary bg-primary-light text-primary-dark"
                : "border-border text-foreground-muted hover:bg-muted"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-sm text-foreground-muted">
          No products in this category yet.
        </p>
      ) : null}
    </div>
  );
}
