import Link from "next/link";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductCard from "@/components/product/ProductCard";
import { getHomepageProducts } from "@/lib/db/products";

export default async function FeaturedProducts() {
  // The full catalogue, so every product (with its pack price and rate per kg) is on the homepage.
  const products = await getHomepageProducts();

  return (
    <section className="py-14">
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Our products"
            title="Shrestha Makhana & essentials"
            description="Every product with its pack price and rate per kg."
          />
          <Link
            href="/shop"
            className="text-sm font-semibold text-primary hover:text-primary-dark"
          >
            Shop all products &rarr;
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
