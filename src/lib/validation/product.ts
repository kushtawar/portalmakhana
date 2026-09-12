import { z } from "zod";

const CATEGORY_VALUES = ["roasted", "flavoured", "raw", "gift-pack", "spice"] as const;

export const productVariantSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional(),
  sku: z.string().min(1),
  stock: z.number().int().min(0),
});

export const productAttributeSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

export const createProductSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase, url-safe (e.g. my-product)"),
  shortDescription: z.string().min(1),
  longDescription: z.string().min(1),
  category: z.enum(CATEGORY_VALUES),
  grade: z.string().optional(),
  flavour: z.string().optional(),
  gstRate: z.number().min(0).max(100),
  priceIncludesTax: z.boolean(),
  variants: z.array(productVariantSchema).min(1),
  imageLabels: z.array(z.string()).default([]),
  imagePath: z.string().optional(),
  featured: z.boolean().default(false),
  bestseller: z.boolean().default(false),
  active: z.boolean().default(true),
  attributes: z.array(productAttributeSchema).default([]),
});

export const updateProductSchema = createProductSchema.partial().extend({
  slug: createProductSchema.shape.slug.optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
