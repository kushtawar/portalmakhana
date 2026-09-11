import Link from "next/link";
import type { Article } from "@/lib/types";
import ProductImagePlaceholder from "@/components/product/ProductImagePlaceholder";
import Badge from "@/components/ui/Badge";

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/stories/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      <ProductImagePlaceholder label={article.coverImageLabel} className="aspect-[16/10] w-full" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Badge variant="muted">{article.category}</Badge>
        <p className="text-sm font-semibold text-foreground group-hover:text-primary">
          {article.title}
        </p>
        <p className="text-xs text-foreground-muted">{article.excerpt}</p>
      </div>
    </Link>
  );
}
