import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import StoriesGrid from "@/components/stories/StoriesGrid";
import { listArticles } from "@/lib/db/articles";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stories & Recipes",
  description:
    "Stories, recipes, Makhana knowledge, health and nutrition articles, and company updates from PatnaMakhana.",
};

export default async function StoriesPage() {
  const articles = await listArticles({ publishedOnly: true });

  return (
    <Container className="py-12">
      <SectionHeading
        eyebrow="Stories & Recipes"
        title="From our kitchen and our fields"
        description="Makhana knowledge, recipes, health notes and updates from the PatnaMakhana team."
      />
      <div className="mt-8">
        <StoriesGrid articles={articles} />
      </div>
    </Container>
  );
}
