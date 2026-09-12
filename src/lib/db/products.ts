import "server-only";
import { connectToDatabase } from "@/lib/db/connect";
import { ProductModel, type ProductDoc } from "@/lib/db/models/Product";
import type { Product } from "@/lib/types";

function toProduct(doc: ProductDoc & { _id: unknown }): Product {
  return {
    id: String(doc._id),
    slug: doc.slug,
    name: doc.name,
    shortDescription: doc.shortDescription,
    longDescription: doc.longDescription,
    category: doc.category,
    grade: doc.grade,
    flavour: doc.flavour,
    gstRate: doc.gstRate,
    priceIncludesTax: doc.priceIncludesTax,
    variants: doc.variants,
    imageLabels: doc.imageLabels,
    imagePath: doc.imagePath,
    featured: doc.featured,
    bestseller: doc.bestseller,
    active: doc.active,
    attributes: doc.attributes,
  };
}

export async function listProducts(options?: {
  category?: string;
  activeOnly?: boolean;
  q?: string;
}): Promise<Product[]> {
  await connectToDatabase();
  const filter: Record<string, unknown> = {};
  if (options?.activeOnly) filter.active = true;
  if (options?.category) filter.category = options.category;
  if (options?.q) {
    filter.$or = [
      { name: { $regex: options.q, $options: "i" } },
      { flavour: { $regex: options.q, $options: "i" } },
    ];
  }
  const docs = await ProductModel.find(filter).sort({ createdAt: 1 }).lean();
  return docs.map((doc) => toProduct(doc as ProductDoc & { _id: unknown }));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await connectToDatabase();
  const doc = await ProductModel.findOne({ slug }).lean();
  return doc ? toProduct(doc as ProductDoc & { _id: unknown }) : null;
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  await connectToDatabase();
  const docs = await ProductModel.find({ featured: true, active: true })
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();
  return docs.map((doc) => toProduct(doc as ProductDoc & { _id: unknown }));
}

export interface StockAlert {
  product: Product;
  variant: Product["variants"][number];
}

export async function getStockAlerts(): Promise<{
  lowStock: StockAlert[];
  outOfStock: StockAlert[];
}> {
  await connectToDatabase();
  const docs = await ProductModel.find({ active: true }).lean();
  const products = docs.map((doc) => toProduct(doc as ProductDoc & { _id: unknown }));

  const lowStock: StockAlert[] = [];
  const outOfStock: StockAlert[] = [];

  for (const product of products) {
    for (const variant of product.variants) {
      const threshold = variant.lowStockThreshold ?? 10;
      if (variant.stock === 0) {
        outOfStock.push({ product, variant });
      } else if (variant.stock <= threshold) {
        lowStock.push({ product, variant });
      }
    }
  }

  return { lowStock, outOfStock };
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  await connectToDatabase();
  const sameCategory = await ProductModel.find({
    slug: { $ne: product.slug },
    active: true,
    category: product.category,
  })
    .limit(limit)
    .lean();

  const results = sameCategory.map((doc) => toProduct(doc as ProductDoc & { _id: unknown }));

  if (results.length < limit) {
    const others = await ProductModel.find({
      slug: { $ne: product.slug, $nin: results.map((r) => r.slug) },
      active: true,
      category: { $ne: product.category },
    })
      .limit(limit - results.length)
      .lean();
    results.push(...others.map((doc) => toProduct(doc as ProductDoc & { _id: unknown })));
  }

  return results;
}
