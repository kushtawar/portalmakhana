import Link from "next/link";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductCard from "@/components/product/ProductCard";
import { getFeaturedProducts } from "@/lib/db/products";

export default async function FeaturedProducts() {
  const featured = await getFeaturedProducts(4);

  return (
    <section className="py-14">
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Bestsellers"
            title="Featured Makhana"
            description="A few customer favourites to start with — our full range is in the shop."
          />
          <Link
            href="/shop"
            className="text-sm font-semibold text-primary hover:text-primary-dark"
          >
            View all products &rarr;
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
