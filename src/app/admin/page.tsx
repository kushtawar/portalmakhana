import Link from "next/link";
import { getStockAlerts, listProducts } from "@/lib/db/products";
import { listPromotions } from "@/lib/db/promotions";
import { countNewEnquiries } from "@/lib/db/enquiries";

export const dynamic = "force-dynamic";

function promotionStatus(promotion: { active: boolean; startAt: string; endAt: string }) {
  if (!promotion.active) return "paused" as const;
  const now = Date.now();
  const start = new Date(promotion.startAt).getTime();
  const end = new Date(promotion.endAt).getTime();
  if (now < start) return "upcoming" as const;
  if (now > end) return "expired" as const;
  return "live" as const;
}

export default async function AdminDashboardPage() {
  const [products, { lowStock, outOfStock }, promotions, newEnquiries] = await Promise.all([
    listProducts({ activeOnly: true }),
    getStockAlerts(),
    listPromotions(),
    countNewEnquiries(),
  ]);

  const livePromotions = promotions.filter((p) => promotionStatus(p) === "live");
  const upcomingPromotions = promotions.filter((p) => promotionStatus(p) === "upcoming");

  const stats = [
    { label: "Active products", value: products.length, href: "/admin/products" },
    { label: "Low stock", value: lowStock.length, href: "/admin/inventory" },
    { label: "Out of stock", value: outOfStock.length, href: "/admin/inventory" },
    { label: "New enquiries", value: newEnquiries, href: "/admin/enquiries" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-primary-dark">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-border bg-card p-5 hover:shadow-md"
          >
            <p className="text-2xl font-semibold text-primary-dark">{stat.value}</p>
            <p className="mt-1 text-xs text-foreground-muted">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Live &amp; scheduled promotions</p>
            <Link href="/admin/promotions" className="text-xs font-medium text-primary hover:underline">
              Manage
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {livePromotions.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{p.title}</span>
                <span className="text-xs font-medium text-primary-dark">
                  Live &middot; ends{" "}
                  {new Date(p.endAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </span>
              </div>
            ))}
            {upcomingPromotions.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{p.title}</span>
                <span className="text-xs font-medium text-accent">
                  Starts{" "}
                  {new Date(p.startAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </span>
              </div>
            ))}
            {livePromotions.length === 0 && upcomingPromotions.length === 0 ? (
              <p className="text-sm text-foreground-muted">No live or scheduled promotions.</p>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Stock alerts</p>
            <Link href="/admin/inventory" className="text-xs font-medium text-primary hover:underline">
              View inventory
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {outOfStock.slice(0, 5).map(({ product, variant }) => (
              <div
                key={`${product.id}-${variant.id}`}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-foreground">
                  {product.name} ({variant.label})
                </span>
                <span className="text-xs font-medium text-danger">Out of stock</span>
              </div>
            ))}
            {lowStock.slice(0, 5).map(({ product, variant }) => (
              <div
                key={`${product.id}-${variant.id}`}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-foreground">
                  {product.name} ({variant.label})
                </span>
                <span className="text-xs font-medium text-accent">{variant.stock} left</span>
              </div>
            ))}
            {lowStock.length === 0 && outOfStock.length === 0 ? (
              <p className="text-sm text-foreground-muted">All products are well stocked.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
