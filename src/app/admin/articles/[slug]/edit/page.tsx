import { notFound } from "next/navigation";
import ArticleForm from "@/app/admin/articles/ArticleForm";
import { getArticleBySlug } from "@/lib/db/articles";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-primary-dark">Edit article</h1>
      <div className="mt-6">
        <ArticleForm article={article} />
      </div>
    </div>
  );
}
