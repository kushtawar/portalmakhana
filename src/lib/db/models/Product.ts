import mongoose, { Schema, type HydratedDocument } from "mongoose";
import type { ProductCategory } from "@/lib/types";

const CATEGORY_VALUES: ProductCategory[] = ["roasted", "flavoured", "raw", "gift-pack", "spice"];

export interface ProductVariantDoc {
  id: string;
  label: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  stock: number;
  lowStockThreshold?: number;
}

export interface ProductAttributeDoc {
  label: string;
  value: string;
}

export interface ProductDoc {
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  category: ProductCategory;
  grade?: string;
  flavour?: string;
  gstRate: number;
  priceIncludesTax: boolean;
  variants: ProductVariantDoc[];
  imageLabels: string[];
  imagePath?: string;
  featured: boolean;
  bestseller: boolean;
  active: boolean;
  attributes: ProductAttributeDoc[];
  createdAt: Date;
  updatedAt: Date;
}

export type ProductHydratedDoc = HydratedDocument<ProductDoc>;

const VariantSchema = new Schema<ProductVariantDoc>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    sku: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, min: 0, default: 10 },
  },
  { _id: false }
);

const AttributeSchema = new Schema<ProductAttributeDoc>(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const ProductSchema = new Schema<ProductDoc>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    shortDescription: { type: String, required: true },
    longDescription: { type: String, required: true },
    category: { type: String, required: true, enum: CATEGORY_VALUES, index: true },
    grade: { type: String },
    flavour: { type: String },
    gstRate: { type: Number, required: true, min: 0, max: 100 },
    priceIncludesTax: { type: Boolean, required: true, default: true },
    variants: { type: [VariantSchema], required: true, validate: (v: unknown[]) => v.length > 0 },
    imageLabels: { type: [String], default: [] },
    imagePath: { type: String },
    featured: { type: Boolean, default: false, index: true },
    bestseller: { type: Boolean, default: false, index: true },
    active: { type: Boolean, default: true, index: true },
    attributes: { type: [AttributeSchema], default: [] },
  },
  { timestamps: true }
);

export const ProductModel =
  (mongoose.models.Product as mongoose.Model<ProductDoc>) ||
  mongoose.model<ProductDoc>("Product", ProductSchema);
