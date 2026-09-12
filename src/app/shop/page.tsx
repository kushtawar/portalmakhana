import type { Metadata } from "next";
import { Suspense } from "react";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import ShopGrid from "@/components/shop/ShopGrid";
import { products } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse premium roasted, flavoured and raw Makhana from ItarIntakes.",
};

export default function ShopPage() {
  const activeProducts = products.filter((product) => product.active);

  return (
    <Container className="py-12">
      <SectionHeading
        eyebrow="Shop"
        title="All Makhana products"
        description="Weight and pack options are shown on each product. Prices include applicable GST unless noted."
      />
      <div className="mt-8">
        <Suspense fallback={null}>
          <ShopGrid products={activeProducts} />
        </Suspense>
      </div>
    </Container>
  );
}
