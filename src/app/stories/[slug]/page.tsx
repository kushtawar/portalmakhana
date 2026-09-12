import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/components/layout/Container";
import ProductImagePlaceholder from "@/components/product/ProductImagePlaceholder";
import Badge from "@/components/ui/Badge";
import { getArticleBySlug } from "@/lib/db/articles";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || article.status !== "published") notFound();

  return (
    <Container className="max-w-3xl py-12">
      <Badge variant="muted">{article.category}</Badge>
      <h1 className="mt-3 font-display text-2xl font-semibold text-primary-dark sm:text-3xl">
        {article.title}
      </h1>
      <p className="mt-2 text-sm text-foreground-muted">
        {new Date(article.publishDate).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}{" "}
        &middot; {article.author}
      </p>

      <ProductImagePlaceholder
        label={article.coverImageLabel}
        className="mt-6 aspect-[16/9] w-full rounded-2xl"
      />

      <div className="mt-8 space-y-4 text-sm leading-relaxed text-foreground-muted">
        {article.content.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </Container>
  );
}
