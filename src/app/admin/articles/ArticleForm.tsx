"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Article, ArticleCategory, ArticleStatus } from "@/lib/types";

const CATEGORIES: ArticleCategory[] = [
  "Stories",
  "Recipes",
  "Makhana Knowledge",
  "Health & Nutrition",
  "Company News",
];
const STATUSES: ArticleStatus[] = ["draft", "published", "archived"];

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

export default function ArticleForm({ article }: { article?: Article }) {
  const router = useRouter();
  const isEdit = Boolean(article);

  const [slug, setSlug] = useState(article?.slug ?? "");
  const [title, setTitle] = useState(article?.title ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [content, setContent] = useState(article?.content.join("\n\n") ?? "");
  const [coverImageLabel, setCoverImageLabel] = useState(article?.coverImageLabel ?? "");
  const [author, setAuthor] = useState(article?.author ?? "ItarIntakes Team");
  const [category, setCategory] = useState<ArticleCategory>(article?.category ?? "Stories");
  const [tags, setTags] = useState(article?.tags.join(", ") ?? "");
  const [publishDate, setPublishDate] = useState(
    article ? toDateInputValue(article.publishDate) : toDateInputValue(new Date().toISOString())
  );
  const [featured, setFeatured] = useState(article?.featured ?? false);
  const [status, setStatus] = useState<ArticleStatus>(article?.status ?? "draft");
  const [seoTitle, setSeoTitle] = useState(article?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(article?.seoDescription ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      slug,
      title,
      excerpt,
      content: content
        .split("\n\n")
        .map((p) => p.trim())
        .filter(Boolean),
      coverImageLabel: coverImageLabel || title,
      author,
      category,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      publishDate: new Date(publishDate).toISOString(),
      featured,
      status,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
    };

    const url = isEdit ? `/api/articles/${article!.slug}` : "/api/articles";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(
        typeof data.error === "string"
          ? data.error
          : "Could not save. Check the fields and try again."
      );
      return;
    }

    router.push("/admin/articles");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 rounded-xl border border-border bg-card p-6 sm:grid-cols-2">
        <label className="text-sm text-foreground-muted sm:col-span-2">
          Title
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="text-sm text-foreground-muted">
          Slug (URL)
          <input
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            disabled={isEdit}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:bg-muted"
          />
          <span className="mt-1 block text-xs text-foreground-muted">
            Will be live at /stories/{slug || "..."}
          </span>
        </label>
        <label className="text-sm text-foreground-muted">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ArticleCategory)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-foreground-muted sm:col-span-2">
          Excerpt (shown on listing cards)
          <input
            required
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="text-sm text-foreground-muted sm:col-span-2">
          Content (separate paragraphs with a blank line)
          <textarea
            required
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="text-sm text-foreground-muted">
          Cover image label (placeholder text until real photography)
          <input
            value={coverImageLabel}
            onChange={(e) => setCoverImageLabel(e.target.value)}
            placeholder={title || "Cover image"}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="text-sm text-foreground-muted">
          Author
          <input
            required
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="text-sm text-foreground-muted">
          Tags (comma-separated)
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="text-sm text-foreground-muted">
          Publish date
          <input
            required
            type="date"
            value={publishDate}
            onChange={(e) => setPublishDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="text-sm text-foreground-muted">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ArticleStatus)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-foreground-muted">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Featured
        </label>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm font-semibold text-foreground">SEO (optional)</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-foreground-muted">
            SEO title
            <input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={title}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </label>
          <label className="text-sm text-foreground-muted">
            SEO description
            <input
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder={excerpt}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </label>
        </div>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-gradient-to-r from-primary to-primary-deep px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Saving..." : isEdit ? "Save changes" : "Create article"}
      </button>
    </form>
  );
}
