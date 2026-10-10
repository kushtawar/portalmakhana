import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/db/products";
import { listArticles } from "@/lib/db/articles";
import { ARTICLE_SLUG_RENAMES } from "@/lib/articleSlugRenames";

const BASE_URL = "https://makhana.innovatetoday.net";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, articles] = await Promise.all([
    listProducts({ activeOnly: true }),
    listArticles({ publishedOnly: true }),
  ]);

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
    url: `${BASE_URL}/stories/${ARTICLE_SLUG_RENAMES[article.slug] ?? article.slug}`,
    lastModified: article.publishDate,
  }));

  return [...staticRoutes, ...productRoutes, ...articleRoutes];
}
