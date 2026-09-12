import Link from "next/link";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import ArticleCard from "@/components/stories/ArticleCard";
import { listArticles } from "@/lib/db/articles";

export default async function StoriesHighlights() {
  const articles = await listArticles({ publishedOnly: true });
  const highlights = [...articles]
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, 3);

  if (highlights.length === 0) return null;

  return (
    <section className="bg-background-subtle py-14">
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Stories & Recipes"
            title="From our kitchen and our fields"
          />
          <Link
            href="/stories"
            className="text-sm font-semibold text-primary hover:text-primary-dark"
          >
            View all stories &rarr;
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {highlights.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </Container>
    </section>
  );
}
