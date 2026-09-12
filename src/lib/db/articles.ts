import "server-only";
import { connectToDatabase } from "@/lib/db/connect";
import { ArticleModel, type ArticleDoc } from "@/lib/db/models/Article";
import type { Article } from "@/lib/types";

function toArticle(doc: ArticleDoc & { _id: unknown }): Article {
  return {
    id: String(doc._id),
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    content: doc.content,
    coverImageLabel: doc.coverImageLabel,
    imagePath: doc.imagePath,
    author: doc.author,
    category: doc.category,
    tags: doc.tags,
    publishDate: doc.publishDate.toISOString(),
    featured: doc.featured,
    status: doc.status,
    seoTitle: doc.seoTitle,
    seoDescription: doc.seoDescription,
  };
}

export async function listArticles(options?: {
  publishedOnly?: boolean;
  category?: string;
}): Promise<Article[]> {
  await connectToDatabase();
  const filter: Record<string, unknown> = {};
  if (options?.publishedOnly) filter.status = "published";
  if (options?.category) filter.category = options.category;

  const docs = await ArticleModel.find(filter).sort({ publishDate: -1 }).lean();
  return docs.map((doc) => toArticle(doc as ArticleDoc & { _id: unknown }));
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  await connectToDatabase();
  const doc = await ArticleModel.findOne({ slug }).lean();
  return doc ? toArticle(doc as ArticleDoc & { _id: unknown }) : null;
}
