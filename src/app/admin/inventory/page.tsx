import Link from "next/link";
import { listProducts } from "@/lib/db/products";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const products = await listProducts({ activeOnly: true });

  return (
    <div>
      <div>
        <h1 className="font-display text-2xl font-semibold text-primary-dark">Inventory</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Stock levels across all active products and variants. Edit stock from the
          product&apos;s edit page.
        </p>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-foreground-muted">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Variant</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Low-stock threshold</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.flatMap((product) =>
              product.variants.map((variant) => {
                const threshold = variant.lowStockThreshold ?? 10;
                const status =
                  variant.stock === 0
                    ? { label: "Out of stock", tone: "text-danger" }
                    : variant.stock <= threshold
                      ? { label: "Low stock", tone: "text-accent" }
                      : { label: "In stock", tone: "text-primary-dark" };

                return (
                  <tr key={`${product.id}-${variant.id}`}>
                    <td className="px-4 py-3 font-medium text-foreground">{product.name}</td>
                    <td className="px-4 py-3 text-foreground-muted">{variant.label}</td>
                    <td className="px-4 py-3 text-foreground-muted">{variant.stock}</td>
                    <td className="px-4 py-3 text-foreground-muted">{threshold}</td>
                    <td className={`px-4 py-3 font-medium ${status.tone}`}>{status.label}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/products/${product.slug}/edit`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {products.length === 0 ? (
          <p className="p-6 text-sm text-foreground-muted">No active products yet.</p>
        ) : null}
      </div>
    </div>
  );
}
