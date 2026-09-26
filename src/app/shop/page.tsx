import type { Metadata } from "next";
import { Suspense } from "react";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import ShopGrid from "@/components/shop/ShopGrid";
import { listProducts } from "@/lib/db/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop Shrestha Makhana (Silver, Gold, Diamond, Handpicked) and spices from ItarIntakes.",
};

export default async function ShopPage() {
  const activeProducts = await listProducts({ activeOnly: true });

  return (
    <Container className="py-12">
      <SectionHeading
        eyebrow="Shop"
        title="All products"
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
