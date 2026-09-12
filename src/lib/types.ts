export interface ProductVariant {
  id: string;
  label: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  stock: number;
  lowStockThreshold?: number;
}

export type ProductCategory = "roasted" | "flavoured" | "raw" | "gift-pack" | "spice";

export interface ProductAttribute {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  category: ProductCategory;
  grade?: string;
  flavour?: string;
  gstRate: number;
  priceIncludesTax: boolean;
  variants: ProductVariant[];
  imageLabels: string[];
  imagePath?: string;
  featured?: boolean;
  bestseller?: boolean;
  active: boolean;
  attributes: ProductAttribute[];
}

export type ArticleCategory =
  | "Stories"
  | "Recipes"
  | "Makhana Knowledge"
  | "Health & Nutrition"
  | "Company News";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  coverImageLabel: string;
  author: string;
  category: ArticleCategory;
  tags: string[];
  publishDate: string;
  featured?: boolean;
}

export interface Promotion {
  id: string;
  slug: string;
  title: string;
  bannerText: string;
  description: string;
  imagePath?: string;
  ctaLabel?: string;
  ctaHref?: string;
  startAt: string;
  endAt: string;
  active: boolean;
}

export type EnquiryType = "wholesale" | "export";
export type EnquiryStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "QUOTED" | "WON" | "LOST";

export interface EnquiryFieldEntry {
  label: string;
  value: string;
}

export interface Enquiry {
  id: string;
  type: EnquiryType;
  // First entry is always the contact name field, by form convention.
  fields: EnquiryFieldEntry[];
  status: EnquiryStatus;
  notes?: string;
  createdAt: string;
}

export interface CartItem {
  productSlug: string;
  productName: string;
  variantId: string;
  variantLabel: string;
  price: number;
  quantity: number;
}
