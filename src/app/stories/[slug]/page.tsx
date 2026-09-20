import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import Container from "@/components/layout/Container";
import ArticleCoverImage from "@/components/stories/ArticleCoverImage";
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
  if (!article) notFound();

  const isPublished = article.status === "published";
  if (!isPublished) {
    const session = await auth();
    if (!session) notFound();
  }

  return (
    <Container className="max-w-3xl py-12">
      {!isPublished ? (
        <div className="mb-6 rounded-lg border border-accent bg-accent-light px-4 py-3 text-sm text-accent">
          Preview only — this article is <strong>{article.status}</strong> and not visible to the
          public.
        </div>
      ) : null}
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

      <ArticleCoverImage
        imagePath={article.imagePath}
        label={article.coverImageLabel}
        priority
        sizes="(min-width: 1024px) 768px, 100vw"
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
