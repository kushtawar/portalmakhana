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

export type ArticleStatus = "draft" | "published" | "archived";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  coverImageLabel: string;
  imagePath?: string;
  author: string;
  category: ArticleCategory;
  tags: string[];
  publishDate: string;
  featured?: boolean;
  status: ArticleStatus;
  seoTitle?: string;
  seoDescription?: string;
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
  blinkBanner: boolean;
}

export type BannerPlacement = "home-hero";

export interface Banner {
  id: string;
  placement: BannerPlacement;
  eyebrow?: string;
  headline: string;
  subtext: string;
  ctaLabel?: string;
  ctaHref?: string;
  imagePath?: string;
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

export type AuditEntityType = "product" | "promotion" | "banner" | "article" | "enquiry";
export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "activate"
  | "deactivate"
  | "publish"
  | "unpublish";

export interface AuditEvent {
  id: string;
  entityType: AuditEntityType;
  entityLabel: string;
  action: AuditAction;
  actor: string;
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
