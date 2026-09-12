import { z } from "zod";

export const createBannerSchema = z.object({
  placement: z.enum(["home-hero"]),
  eyebrow: z.string().optional(),
  headline: z.string().min(1),
  subtext: z.string().min(1),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  imagePath: z.string().optional(),
  active: z.boolean().default(true),
});

export const updateBannerSchema = createBannerSchema.partial();

export type CreateBannerInput = z.infer<typeof createBannerSchema>;
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;
