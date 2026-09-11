import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatInr } from "@/lib/format";
import { getPackType } from "@/lib/data/products";
import ProductImage from "@/components/product/ProductImage";
import Badge from "@/components/ui/Badge";

export default function ProductCard({ product }: { product: Product }) {
  const primaryVariant = product.variants[0];
  const inStock = product.variants.some((variant) => variant.stock > 0);

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden">
        <ProductImage
          imagePath={product.imagePath}
          packType={getPackType(product)}
          label={product.imageLabels[0]}
          className="h-full w-full"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.bestseller ? <Badge variant="primary">Bestseller</Badge> : null}
          {product.featured && !product.bestseller ? (
            <Badge variant="accent">Featured</Badge>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-sm font-semibold text-foreground group-hover:text-primary">
          {product.name}
        </p>
        <p className="text-xs text-foreground-muted">
          {primaryVariant.label}
          {product.variants.length > 1 ? ` + ${product.variants.length - 1} more` : ""}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold text-foreground">
              {formatInr(primaryVariant.price)}
            </span>
            {primaryVariant.compareAtPrice ? (
              <span className="text-xs text-foreground-muted line-through">
                {formatInr(primaryVariant.compareAtPrice)}
              </span>
            ) : null}
          </div>
          <span
            className={`text-xs font-medium ${inStock ? "text-accent" : "text-danger"}`}
          >
            {inStock ? "In stock" : "Out of stock"}
          </span>
        </div>
      </div>
    </Link>
  );
}
