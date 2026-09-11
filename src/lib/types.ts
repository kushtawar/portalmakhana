export interface ProductVariant {
  id: string;
  label: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  stock: number;
}

export type ProductCategory = "roasted" | "flavoured" | "raw" | "gift-pack";

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

export interface CartItem {
  productSlug: string;
  productName: string;
  variantId: string;
  variantLabel: string;
  price: number;
  quantity: number;
}
