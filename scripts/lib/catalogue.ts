// Pure planning rules for scripts/update-catalogue.ts (unit-tested in tests/).

import type { Product } from "@/lib/types";

/** Product details the catalogue owns; all other details are left as they are. */
export const MANAGED_ATTRIBUTES = ["Net weight", "Price per kg", "Type"];

/**
 * Products whose long description the catalogue owns. Their old descriptions incorrectly
 * listed "Mircha", so the catalogue text is always enforced for them. Every other existing
 * product keeps the description it has in the database.
 */
export const MANAGED_DESCRIPTION_SLUGS = new Set(["shrestha-haldi-powder", "shrestha-dhaniya-powder"]);

type Attribute = { label: string; value: string };
type Variant = { id: string; label: string; price: number; sku: string; stock: number; [key: string]: unknown };
export type ExistingProduct = Record<string, unknown>;

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export function mergeAttributes(existing: Attribute[], wanted: Attribute[]): Attribute[] {
  const managed = wanted.filter((a) => MANAGED_ATTRIBUTES.includes(a.label));
  const merged = existing.map((a) => managed.find((m) => m.label === a.label) ?? a);
  for (const m of managed) if (!merged.some((a) => a.label === m.label)) merged.push(m);
  return merged;
}

/**
 * Fields to change on an existing product, with their current values. Only name, image
 * label, grade, category, the pack (label, price, SKU — stock kept) and the managed details
 * and descriptions are considered. GST, stock, photos, other descriptions,
 * Featured/Bestseller and archive status are never touched.
 */
export function planProductUpdate(existing: ExistingProduct, wanted: Product) {
  const variants = (existing.variants as Variant[]) ?? [];
  const nextVariants = wanted.variants.map((w) => {
    const current = variants.find((v) => v.id === w.id);
    return {
      ...(current ?? {}),
      id: w.id,
      label: w.label,
      price: w.price,
      sku: w.sku,
      stock: current?.stock ?? w.stock,
    };
  });
  const candidate: Record<string, unknown> = {
    name: wanted.name,
    imageLabels: [wanted.name],
    category: wanted.category,
    variants: nextVariants,
    attributes: mergeAttributes((existing.attributes as Attribute[]) ?? [], wanted.attributes),
  };
  if (wanted.grade) candidate.grade = wanted.grade;
  if (MANAGED_DESCRIPTION_SLUGS.has(wanted.slug)) candidate.longDescription = wanted.longDescription;

  const set: Record<string, unknown> = {};
  const before: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(candidate)) {
    if (!same(existing[key], value)) {
      set[key] = value;
      before[key] = existing[key];
    }
  }
  return { set, before };
}

/** Document for a catalogue product that doesn't exist yet. */
export function buildInsert(wanted: Product, now: Date): Record<string, unknown> {
  const { id: _id, ...doc } = wanted;
  void _id;
  // Raw driver inserts skip Mongoose defaults: set them explicitly and drop empty keys.
  const clean = Object.fromEntries(Object.entries(doc).filter(([, v]) => v !== undefined));
  return {
    ...clean,
    featured: wanted.featured ?? false,
    bestseller: wanted.bestseller ?? false,
    variants: wanted.variants.map((v) => ({ lowStockThreshold: 10, ...v })),
    createdAt: now,
    updatedAt: now,
  };
}
