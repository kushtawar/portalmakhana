import mongoose, { Schema, type HydratedDocument } from "mongoose";
import type { ArticleCategory, ArticleStatus } from "@/lib/types";

const CATEGORY_VALUES: ArticleCategory[] = [
  "Stories",
  "Recipes",
  "Makhana Knowledge",
  "Health & Nutrition",
  "Company News",
];
const STATUS_VALUES: ArticleStatus[] = ["draft", "published", "archived"];

export interface ArticleDoc {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  coverImageLabel: string;
  imagePath?: string;
  author: string;
  category: ArticleCategory;
  tags: string[];
  publishDate: Date;
  featured: boolean;
  status: ArticleStatus;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ArticleHydratedDoc = HydratedDocument<ArticleDoc>;

const ArticleSchema = new Schema<ArticleDoc>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    content: { type: [String], required: true, validate: (v: unknown[]) => v.length > 0 },
    coverImageLabel: { type: String, required: true },
    imagePath: { type: String },
    author: { type: String, required: true },
    category: { type: String, required: true, enum: CATEGORY_VALUES, index: true },
    tags: { type: [String], default: [] },
    publishDate: { type: Date, required: true },
    featured: { type: Boolean, default: false, index: true },
    status: { type: String, required: true, enum: STATUS_VALUES, default: "draft", index: true },
    seoTitle: { type: String },
    seoDescription: { type: String },
  },
  { timestamps: true }
);

export const ArticleModel =
  (mongoose.models.Article as mongoose.Model<ArticleDoc>) ||
  mongoose.model<ArticleDoc>("Article", ArticleSchema);
