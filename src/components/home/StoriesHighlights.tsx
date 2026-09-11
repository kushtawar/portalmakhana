import Link from "next/link";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import ArticleCard from "@/components/stories/ArticleCard";
import { articles } from "@/lib/data/articles";

export default function StoriesHighlights() {
  const highlights = articles.slice(0, 3);

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
