import Link from "next/link";
import Container from "@/components/layout/Container";
import ProductImage from "@/components/product/ProductImage";

export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-background-subtle to-background">
      <Container className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Premium Makhana from Patna
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            10+ years of Makhana expertise, delivered to your door
          </h1>
          <p className="mt-4 max-w-lg text-foreground-muted">
            ItarIntakes brings premium, carefully graded fox nuts from Patna to
            homes, businesses and export partners across the world —
            transparent pricing, no hidden charges.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center rounded-full bg-gradient-to-r from-primary to-primary-dark px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              Shop Makhana
            </Link>
            <Link
              href="/wholesale"
              className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Wholesale &amp; Export
            </Link>
          </div>
        </div>

        <ProductImage
          imagePath="/products/classic-roasted-makhana.jpg"
          packType="makhana"
          label="Premium Makhana"
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="aspect-[4/3] w-full rounded-2xl"
        />
      </Container>
    </section>
  );
}
