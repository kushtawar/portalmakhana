import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/components/layout/Container";
import ProductImage from "@/components/product/ProductImage";
import ProductPurchasePanel from "@/components/product/ProductPurchasePanel";
import RelatedProducts from "@/components/product/RelatedProducts";
import { getPackType } from "@/lib/data/products";
import { getProductBySlug, getRelatedProducts } from "@/lib/db/products";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDescription,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.active) notFound();

  const related = await getRelatedProducts(product);

  return (
    <Container className="py-12">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-1">
          <ProductImage
            imagePath={product.imagePath}
            packType={getPackType(product)}
            label={product.imageLabels[0]}
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="col-span-4 aspect-square w-full rounded-2xl sm:col-span-1"
          />
        </div>

        <div>
          <p className="text-sm font-medium text-primary">
            {product.grade
              ? `Grade: ${product.grade}`
              : product.category === "spice"
                ? "Pure Indian Spice"
                : "Makhana"}
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-primary-dark sm:text-3xl">
            {product.name}
          </h1>
          <p className="mt-2 text-foreground-muted">{product.shortDescription}</p>

          <div className="mt-6">
            <ProductPurchasePanel product={product} />
          </div>
        </div>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-foreground">Description</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
            {product.longDescription}
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Product details</h2>
          <dl className="mt-3 space-y-2">
            {product.attributes.map((attribute) => (
              <div key={attribute.label} className="flex justify-between text-sm">
                <dt className="text-foreground-muted">{attribute.label}</dt>
                <dd className="font-medium text-foreground">{attribute.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <RelatedProducts products={related} />
    </Container>
  );
}
