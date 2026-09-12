"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ArticleStatus } from "@/lib/types";

export default function ArticleRowActions({
  slug,
  status,
}: {
  slug: string;
  status: ArticleStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const setStatus = async (next: ArticleStatus) => {
    setBusy(true);
    await fetch(`/api/articles/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    router.refresh();
  };

  const remove = async () => {
    if (!confirm(`Delete "${slug}"? This cannot be undone.`)) return;
    setBusy(true);
    await fetch(`/api/articles/${slug}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  };

  return (
    <div className="flex items-center justify-end gap-3 text-xs">
      <Link href={`/stories/${slug}`} target="_blank" className="font-medium text-primary hover:underline">
        View
      </Link>
      <Link href={`/admin/articles/${slug}/edit`} className="font-medium text-primary hover:underline">
        Edit
      </Link>
      {status !== "published" ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => setStatus("published")}
          className="font-medium text-foreground-muted hover:text-primary disabled:opacity-50"
        >
          Publish
        </button>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => setStatus("archived")}
          className="font-medium text-foreground-muted hover:text-primary disabled:opacity-50"
        >
          Unpublish
        </button>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={remove}
        className="font-medium text-danger hover:underline disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
