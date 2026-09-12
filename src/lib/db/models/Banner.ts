import mongoose, { Schema, type HydratedDocument } from "mongoose";
import type { BannerPlacement } from "@/lib/types";

const PLACEMENT_VALUES: BannerPlacement[] = ["home-hero"];

export interface BannerDoc {
  placement: BannerPlacement;
  eyebrow?: string;
  headline: string;
  subtext: string;
  ctaLabel?: string;
  ctaHref?: string;
  imagePath?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type BannerHydratedDoc = HydratedDocument<BannerDoc>;

const BannerSchema = new Schema<BannerDoc>(
  {
    placement: { type: String, required: true, enum: PLACEMENT_VALUES, index: true },
    eyebrow: { type: String },
    headline: { type: String, required: true },
    subtext: { type: String, required: true },
    ctaLabel: { type: String },
    ctaHref: { type: String },
    imagePath: { type: String },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const BannerModel =
  (mongoose.models.Banner as mongoose.Model<BannerDoc>) ||
  mongoose.model<BannerDoc>("Banner", BannerSchema);
