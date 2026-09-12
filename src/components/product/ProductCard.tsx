"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { formatInr } from "@/lib/format";
import { getPackType } from "@/lib/data/products";
import ProductImage from "@/components/product/ProductImage";
import Badge from "@/components/ui/Badge";
import { useCart } from "@/lib/cart/CartContext";

export default function ProductCard({ product }: { product: Product }) {
  const primaryVariant = product.variants[0];
  const inStock = product.variants.some((variant) => variant.stock > 0);
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem({
      productSlug: product.slug,
      productName: product.name,
      variantId: `${product.slug}-${primaryVariant.id}`,
      variantLabel: primaryVariant.label,
      price: primaryVariant.price,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
      <Link href={`/shop/${product.slug}`} className="relative block aspect-square w-full overflow-hidden">
        <ProductImage
          imagePath={product.imagePath}
          packType={getPackType(product)}
          label={product.imageLabels[0]}
          className="h-full w-full"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.bestseller ? <Badge variant="primary">Bestseller</Badge> : null}
          {product.featured && !product.bestseller ? (
            <Badge variant="accent">Featured</Badge>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <Link href={`/shop/${product.slug}`}>
          <p className="text-sm font-semibold text-foreground group-hover:text-primary">
            {product.name}
          </p>
        </Link>
        <p className="text-xs text-foreground-muted">
          {primaryVariant.label}
          {product.variants.length > 1 ? ` + ${product.variants.length - 1} more` : ""}
        </p>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-sm font-semibold text-foreground">
            {formatInr(primaryVariant.price)}
          </span>
          {primaryVariant.compareAtPrice ? (
            <span className="text-xs text-foreground-muted line-through">
              {formatInr(primaryVariant.compareAtPrice)}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          disabled={!inStock}
          onClick={handleAddToCart}
          className="mt-3 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-deep px-4 py-2 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
            <path
              d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L20 8H6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="9.5" cy="20" r="1.3" fill="currentColor" />
            <circle cx="17" cy="20" r="1.3" fill="currentColor" />
          </svg>
          {!inStock ? "Out of stock" : added ? "Added" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
