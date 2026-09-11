import SectionHeading from "@/components/ui/SectionHeading";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/lib/types";

export default function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="mt-16">
      <SectionHeading title="You may also like" />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
