import mongoose, { Schema, type HydratedDocument } from "mongoose";

export interface PromotionDoc {
  slug: string;
  title: string;
  bannerText: string;
  description: string;
  imagePath?: string;
  ctaLabel?: string;
  ctaHref?: string;
  startAt: Date;
  endAt: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PromotionHydratedDoc = HydratedDocument<PromotionDoc>;

const PromotionSchema = new Schema<PromotionDoc>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    bannerText: { type: String, required: true },
    description: { type: String, required: true },
    imagePath: { type: String },
    ctaLabel: { type: String },
    ctaHref: { type: String },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const PromotionModel =
  (mongoose.models.Promotion as mongoose.Model<PromotionDoc>) ||
  mongoose.model<PromotionDoc>("Promotion", PromotionSchema);
