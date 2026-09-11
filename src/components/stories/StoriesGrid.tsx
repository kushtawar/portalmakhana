"use client";

import { useMemo, useState } from "react";
import type { Article, ArticleCategory } from "@/lib/types";
import ArticleCard from "@/components/stories/ArticleCard";

export default function StoriesGrid({ articles }: { articles: Article[] }) {
  const [category, setCategory] = useState<ArticleCategory | "all">("all");

  const categories = useMemo(
    () => Array.from(new Set(articles.map((article) => article.category))),
    [articles]
  );

  const filtered =
    category === "all" ? articles : articles.filter((article) => article.category === category);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            category === "all"
              ? "border-primary bg-primary-light text-primary-dark"
              : "border-border text-foreground-muted hover:bg-muted"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              category === cat
                ? "border-primary bg-primary-light text-primary-dark"
                : "border-border text-foreground-muted hover:bg-muted"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
