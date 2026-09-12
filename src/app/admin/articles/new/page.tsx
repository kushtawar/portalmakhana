import ArticleForm from "@/app/admin/articles/ArticleForm";

export default function NewArticlePage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-primary-dark">New article</h1>
      <div className="mt-6">
        <ArticleForm />
      </div>
    </div>
  );
}
