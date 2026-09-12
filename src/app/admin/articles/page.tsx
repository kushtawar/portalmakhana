import Link from "next/link";
import { listArticles } from "@/lib/db/articles";
import ArticleRowActions from "@/app/admin/articles/ArticleRowActions";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, string> = {
  draft: "text-foreground-muted",
  published: "text-primary-dark",
  archived: "text-foreground-muted",
};

export default async function AdminArticlesPage() {
  const articles = await listArticles();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-primary-dark">
          Stories &amp; Articles
        </h1>
        <Link
          href="/admin/articles/new"
          className="rounded-full bg-gradient-to-r from-primary to-primary-deep px-5 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
        >
          New article
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-foreground-muted">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Publish date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {articles.map((article) => (
              <tr key={article.id}>
                <td className="px-4 py-3 font-medium text-foreground">{article.title}</td>
                <td className="px-4 py-3 text-foreground-muted">{article.category}</td>
                <td className="px-4 py-3 text-foreground-muted">
                  {new Date(article.publishDate).toLocaleDateString("en-IN", {
                    dateStyle: "medium",
                  })}
                </td>
                <td className={`px-4 py-3 font-medium capitalize ${STATUS_TONE[article.status]}`}>
                  {article.status}
                </td>
                <td className="px-4 py-3 text-right">
                  <ArticleRowActions slug={article.slug} status={article.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {articles.length === 0 ? (
          <p className="p-6 text-sm text-foreground-muted">No articles yet.</p>
        ) : null}
      </div>
    </div>
  );
}
