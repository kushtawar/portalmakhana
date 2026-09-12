"use client";

import Link from "next/link";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { useCart } from "@/lib/cart/CartContext";
import { formatInr } from "@/lib/format";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <Container className="py-16 text-center">
        <SectionHeading title="Your cart is empty" align="center" />
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center rounded-full bg-gradient-to-r from-primary to-primary-deep px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          Continue shopping
        </Link>
      </Container>
    );
  }

  const estimatedShipping = subtotal >= 999 ? 0 : 79;
  const total = subtotal + estimatedShipping;

  return (
    <Container className="py-12">
      <SectionHeading title="Your cart" />

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="flex items-center justify-between gap-4 rounded-xl border border-border p-4"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{item.productName}</p>
                <p className="text-xs text-foreground-muted">{item.variantLabel}</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatInr(item.price)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-full border border-border">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    className="flex h-8 w-8 items-center justify-center text-foreground-muted hover:text-foreground"
                    aria-label="Decrease quantity"
                  >
                    &minus;
                  </button>
                  <span className="w-7 text-center text-sm">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center text-foreground-muted hover:text-foreground"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.variantId)}
                  className="text-xs font-medium text-danger hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-foreground">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-foreground-muted">
              <span>Subtotal</span>
              <span>{formatInr(subtotal)}</span>
            </div>
            <div className="flex justify-between text-foreground-muted">
              <span>Estimated shipping</span>
              <span>{estimatedShipping === 0 ? "Free" : formatInr(estimatedShipping)}</span>
            </div>
            <p className="text-xs text-foreground-muted">
              GST is included in product prices. Final total is confirmed at checkout.
            </p>
          </div>
          <div className="mt-4 flex justify-between border-t border-border pt-4 text-sm font-semibold text-foreground">
            <span>Total</span>
            <span>{formatInr(total)}</span>
          </div>
          <Link
            href="/checkout"
            className="mt-5 flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary-deep px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            Proceed to checkout
          </Link>
        </div>
      </div>
    </Container>
  );
}
