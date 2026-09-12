import { z } from "zod";

const CATEGORY_VALUES = [
  "Stories",
  "Recipes",
  "Makhana Knowledge",
  "Health & Nutrition",
  "Company News",
] as const;

export const createArticleSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase, url-safe (e.g. my-story)"),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  content: z.array(z.string().min(1)).min(1),
  coverImageLabel: z.string().min(1),
  imagePath: z.string().optional(),
  author: z.string().min(1),
  category: z.enum(CATEGORY_VALUES),
  tags: z.array(z.string()).default([]),
  publishDate: z.string().min(1),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const updateArticleSchema = createArticleSchema.partial().extend({
  slug: createArticleSchema.shape.slug.optional(),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
