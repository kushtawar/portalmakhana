import type { MetadataRoute } from "next";
import { products } from "@/lib/data/products";
import { articles } from "@/lib/data/articles";

// Placeholder production domain until the custom domain goes live.
const BASE_URL = "https://itarintakes.com";

export default function sitemap(): MetadataRoute.Sitemap {
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

  const productRoutes = products
    .filter((product) => product.active)
    .map((product) => ({
      url: `${BASE_URL}/shop/${product.slug}`,
      lastModified: new Date(),
    }));

  const articleRoutes = articles.map((article) => ({
    url: `${BASE_URL}/stories/${article.slug}`,
    lastModified: article.publishDate,
  }));

  return [...staticRoutes, ...productRoutes, ...articleRoutes];
}
