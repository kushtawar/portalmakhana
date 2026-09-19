import { z } from "zod";

export const createPromotionSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase, url-safe (e.g. diwali-offer)"),
    title: z.string().min(1),
    bannerText: z.string().min(1),
    description: z.string().min(1),
    imagePath: z.string().optional(),
    ctaLabel: z.string().optional(),
    ctaHref: z.string().optional(),
    startAt: z.string().datetime().or(z.string().min(1)),
    endAt: z.string().datetime().or(z.string().min(1)),
    active: z.boolean().default(true),
    blinkBanner: z.boolean().default(false),
  })
  .refine((data) => new Date(data.endAt).getTime() > new Date(data.startAt).getTime(), {
    message: "endAt must be after startAt",
    path: ["endAt"],
  });

export const updatePromotionSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  title: z.string().min(1).optional(),
  bannerText: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  imagePath: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  startAt: z.string().min(1).optional(),
  endAt: z.string().min(1).optional(),
  active: z.boolean().optional(),
  blinkBanner: z.boolean().optional(),
});

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;
