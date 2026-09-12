import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/db/products";
import { articles } from "@/lib/data/articles";

// Placeholder production domain until the custom domain goes live.
const BASE_URL = "https://itarintakes.com";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await listProducts({ activeOnly: true });

  const staticRoutes = [
    "",
    "/shop",
    "/cart",
    "/checkout",
    "/about",
    "/wholesale",
    "/export",
    "/stories",
    "/contact",
    "/policies/shipping-returns",
    "/policies/refunds",
    "/policies/privacy",
    "/policies/terms",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }));

  const productRoutes = products.map((product) => ({
    url: `${BASE_URL}/shop/${product.slug}`,
    lastModified: new Date(),
  }));

  const articleRoutes = articles.map((article) => ({
    url: `${BASE_URL}/stories/${article.slug}`,
    lastModified: article.publishDate,
  }));

  return [...staticRoutes, ...productRoutes, ...articleRoutes];
}
