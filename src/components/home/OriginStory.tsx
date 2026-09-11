import Link from "next/link";
import Container from "@/components/layout/Container";
import ProductImagePlaceholder from "@/components/product/ProductImagePlaceholder";

export default function OriginStory() {
  return (
    <section className="py-14">
      <Container className="grid items-center gap-10 lg:grid-cols-2">
        <ProductImagePlaceholder
          label="Patna Sourcing"
          className="aspect-[4/3] w-full rounded-2xl lg:order-2"
        />
        <div className="lg:order-1">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Our Origin
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-foreground sm:text-3xl">
            From Patna, with 10+ years of experience
          </h2>
          <p className="mt-3 text-foreground-muted">
            ItarIntakes is rooted in Patna, one of India&apos;s traditional centres
            for Makhana cultivation and trade. What started as sourcing and
            supply for local and regional buyers has grown into a business
            that now serves retail customers, distributors and export
            partners — without losing sight of the grading and quality
            standards we started with.
          </p>
          <Link
            href="/about"
            className="mt-4 inline-flex text-sm font-semibold text-primary hover:text-primary-dark"
          >
            Read our full story &rarr;
          </Link>
        </div>
      </Container>
    </section>
  );
}
