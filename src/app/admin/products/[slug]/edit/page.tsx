import { notFound } from "next/navigation";
import ProductForm from "@/app/admin/products/ProductForm";
import { getProductBySlug } from "@/lib/db/products";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-primary-dark">Edit product</h1>
      <div className="mt-6">
        <ProductForm product={product} />
      </div>
    </div>
  );
}
