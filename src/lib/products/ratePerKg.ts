// "Rate per kg" shown next to every pack price (cards and product pages).

import type { Product } from "@/lib/types";

/** Grams in a pack label such as "250 g", "100g" or "1 kg"; null if it isn't a weight. */
export function packGrams(label: string): number | null {
  const match = /^\s*(\d+(?:\.\d+)?)\s*(g|gm|grams?|kg|kilo(?:gram)?s?)\s*$/i.exec(label);
  if (!match) return null;
  const amount = Number(match[1]);
  return /^k/i.test(match[2]) ? amount * 1000 : amount;
}

/**
 * The product's rate per kg, e.g. "₹1,300/kg": the catalogue's "Price per kg" detail when
 * present, otherwise calculated from the first pack's weight and price. Null when neither
 * is available.
 */
export function ratePerKgLabel(product: Pick<Product, "attributes" | "variants">): string | null {
  const listed = product.attributes?.find((a) => a.label.toLowerCase() === "price per kg")?.value;
  if (listed) return listed;
  const variant = product.variants?.[0];
  const grams = variant ? packGrams(variant.label) : null;
  if (!variant || !grams) return null;
  return `₹${Math.round((variant.price * 1000) / grams).toLocaleString("en-IN")}/kg`;
}
