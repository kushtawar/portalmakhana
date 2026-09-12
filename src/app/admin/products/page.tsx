import Link from "next/link";
import { connectToDatabase } from "@/lib/db/connect";
import { ProductModel } from "@/lib/db/models/Product";
import { formatInr } from "@/lib/format";
import ProductRowActions from "@/app/admin/products/ProductRowActions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await connectToDatabase();
  const products = await ProductModel.find().sort({ createdAt: 1 }).lean();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-primary-dark">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-gradient-to-r from-primary to-primary-deep px-5 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
        >
          New product
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-foreground-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Flags</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => {
              const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
              return (
                <tr key={String(product._id)}>
                  <td className="px-4 py-3 font-medium text-foreground">{product.name}</td>
                  <td className="px-4 py-3 text-foreground-muted">{product.category}</td>
                  <td className="px-4 py-3 text-foreground-muted">
                    {formatInr(product.variants[0]?.price ?? 0)}
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">{totalStock}</td>
                  <td className="px-4 py-3 text-foreground-muted">
                    {[
                      product.featured ? "Featured" : null,
                      product.bestseller ? "Bestseller" : null,
                    ]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        product.active
                          ? "text-primary-dark"
                          : "text-foreground-muted"
                      }
                    >
                      {product.active ? "Active" : "Archived"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ProductRowActions slug={product.slug} active={product.active} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 ? (
          <p className="p-6 text-sm text-foreground-muted">
            No products yet. Create one, or run the seed script.
          </p>
        ) : null}
      </div>
    </div>
  );
}
