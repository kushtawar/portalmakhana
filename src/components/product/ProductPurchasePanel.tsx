"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { formatInr } from "@/lib/format";
import { useCart } from "@/lib/cart/CartContext";

export default function ProductPurchasePanel({ product }: { product: Product }) {
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const inStock = variant.stock > 0;

  const addToCart = () => {
    addItem({
      productSlug: product.slug,
      productName: product.name,
      variantId: `${product.slug}-${variant.id}`,
      variantLabel: variant.label,
      price: variant.price,
      quantity,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const buyNow = () => {
    addToCart();
    router.push("/cart");
  };

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-semibold text-foreground">{formatInr(variant.price)}</p>
        {variant.compareAtPrice ? (
          <p className="text-sm text-foreground-muted line-through">
            {formatInr(variant.compareAtPrice)}
          </p>
        ) : null}
      </div>
      <p className="mt-1 text-xs text-foreground-muted">
        {product.priceIncludesTax
          ? `Inclusive of ${product.gstRate}% GST`
          : `Excludes ${product.gstRate}% GST`}
      </p>

      <div className="mt-5">
        <p className="text-sm font-medium text-foreground">Weight</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {product.variants.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVariantId(v.id)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                v.id === variantId
                  ? "border-primary bg-primary-light text-primary-dark"
                  : "border-border text-foreground-muted hover:bg-muted"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <p className="text-sm font-medium text-foreground">Quantity</p>
        <div className="flex items-center rounded-full border border-border">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-9 w-9 items-center justify-center text-foreground-muted hover:text-foreground"
            aria-label="Decrease quantity"
          >
            &minus;
          </button>
          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(variant.stock, q + 1))}
            className="flex h-9 w-9 items-center justify-center text-foreground-muted hover:text-foreground"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <p className={`mt-3 text-xs font-medium ${inStock ? "text-accent" : "text-danger"}`}>
        {inStock ? `${variant.stock} in stock` : "Out of stock"}
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={!inStock}
          onClick={addToCart}
          className="flex-1 rounded-full border border-primary px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          {justAdded ? "Added to cart" : "Add to cart"}
        </button>
        <button
          type="button"
          disabled={!inStock}
          onClick={buyNow}
          className="flex-1 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buy now
        </button>
      </div>

      <p className="mt-4 text-xs text-foreground-muted">
        Shipping calculated at checkout. Dispatched within 1-2 business days.
      </p>
    </div>
  );
}
