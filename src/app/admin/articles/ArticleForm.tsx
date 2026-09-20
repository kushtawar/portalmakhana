"use client";

import Image from "next/image";
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export default function ArticleForm({ article }: { article?: Article }) {
  const router = useRouter();
  const isEdit = Boolean(article);

  const [slug, setSlug] = useState(article?.slug ?? "");
  const [title, setTitle] = useState(article?.title ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [content, setContent] = useState(article?.content.join("\n\n") ?? "");
  const [coverImageLabel, setCoverImageLabel] = useState(article?.coverImageLabel ?? "");
  const [imagePath, setImagePath] = useState(article?.imagePath ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
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
  const [parsingDoc, setParsingDoc] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

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
      imagePath: imagePath || undefined,
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

  const handleImageUpload = async (file: File) => {
    setUploadError(null);
    setUploading(true);

    const body = new FormData();
    body.append("file", file);
    body.append("folder", "articles");

    try {
      const res = await fetch("/api/media/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setImagePath(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentUpload = async (file: File) => {
    setParseError(null);
    setParsingDoc(true);

    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/articles/parse-document", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not read this document");

      setTitle(data.title);
      if (!slug) setSlug(slugify(data.title));
      setExcerpt(data.excerpt);
      setContent(data.content.join("\n\n"));
      if (data.coverImageUrl) setImagePath(data.coverImageUrl);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Could not read this document");
    } finally {
      setParsingDoc(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-dashed border-primary/40 bg-primary-light/40 p-6">
        <p className="text-sm font-semibold text-foreground">
          Start from a Word or PDF document (optional)
        </p>
        <p className="mt-1 text-xs text-foreground-muted">
          Upload a .docx or .pdf and the fields below will be filled in automatically from it —
          review and edit everything before saving. Works best with a clear first line/heading as
          the title and normal paragraphs; a Word document&apos;s first image is used as the cover
          photo.
        </p>
        <input
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,application/pdf"
          disabled={parsingDoc}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleDocumentUpload(file);
          }}
          className="mt-3 text-sm text-foreground-muted"
        />
        {parsingDoc ? (
          <p className="mt-2 text-xs text-foreground-muted">Reading document...</p>
        ) : null}
        {parseError ? <p className="mt-2 text-xs text-danger">{parseError}</p> : null}
      </div>

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
        <label className="text-sm text-foreground-muted sm:col-span-2">
          Cover image
          <div className="mt-1 flex items-center gap-4">
            {imagePath ? (
              <div className="relative h-16 w-24 overflow-hidden rounded-lg border border-border">
                <Image src={imagePath} alt="Cover preview" fill className="object-cover" />
              </div>
            ) : null}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleImageUpload(file);
              }}
              className="text-sm text-foreground-muted"
            />
            {uploading ? <span className="text-xs text-foreground-muted">Uploading...</span> : null}
            {imagePath ? (
              <button
                type="button"
                onClick={() => setImagePath("")}
                className="text-xs text-danger underline"
              >
                Remove
              </button>
            ) : null}
          </div>
          {uploadError ? <p className="mt-1 text-xs text-danger">{uploadError}</p> : null}
          <span className="mt-1 block text-xs text-foreground-muted">JPEG, PNG or WebP, up to 5MB.</span>
        </label>
        <label className="text-sm text-foreground-muted">
          Cover image alt text (used as label when no image is uploaded)
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
