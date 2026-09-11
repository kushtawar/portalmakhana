"use client";

import Link from "next/link";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { useCart } from "@/lib/cart/CartContext";
import { formatInr } from "@/lib/format";

export default function CheckoutPage() {
  const { items, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <Container className="py-16 text-center">
        <SectionHeading title="Your cart is empty" align="center" />
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
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
      <SectionHeading title="Checkout" description="Guest checkout — no account required." />

      <form
        onSubmit={(event) => event.preventDefault()}
        className="mt-8 grid gap-10 lg:grid-cols-3"
      >
        <div className="space-y-6 lg:col-span-2">
          <fieldset className="rounded-xl border border-border p-6">
            <legend className="px-1 text-sm font-semibold text-foreground">
              Contact details
            </legend>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-foreground-muted">
                Full name
                <input
                  required
                  type="text"
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </label>
              <label className="text-sm text-foreground-muted">
                Mobile number
                <input
                  required
                  type="tel"
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </label>
              <label className="text-sm text-foreground-muted sm:col-span-2">
                Email (recommended)
                <input
                  type="email"
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="rounded-xl border border-border p-6">
            <legend className="px-1 text-sm font-semibold text-foreground">
              Shipping address
            </legend>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-foreground-muted sm:col-span-2">
                Address line
                <input
                  required
                  type="text"
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </label>
              <label className="text-sm text-foreground-muted">
                City
                <input
                  required
                  type="text"
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </label>
              <label className="text-sm text-foreground-muted">
                State
                <input
                  required
                  type="text"
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </label>
              <label className="text-sm text-foreground-muted">
                PIN code
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </label>
              <label className="text-sm text-foreground-muted">
                GSTIN (optional, for business orders)
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </label>
            </div>
          </fieldset>
        </div>

        <div className="h-fit rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-foreground">Order summary</h2>
          <div className="mt-4 space-y-2">
            {items.map((item) => (
              <div key={item.variantId} className="flex justify-between text-sm text-foreground-muted">
                <span>
                  {item.productName} ({item.variantLabel}) &times; {item.quantity}
                </span>
                <span>{formatInr(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-foreground-muted">
              <span>Subtotal</span>
              <span>{formatInr(subtotal)}</span>
            </div>
            <div className="flex justify-between text-foreground-muted">
              <span>Estimated shipping</span>
              <span>{estimatedShipping === 0 ? "Free" : formatInr(estimatedShipping)}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-border pt-4 text-sm font-semibold text-foreground">
            <span>Total</span>
            <span>{formatInr(total)}</span>
          </div>

          <button
            type="submit"
            disabled
            className="mt-5 w-full cursor-not-allowed rounded-full bg-primary/40 px-6 py-3 text-sm font-semibold text-white"
          >
            Payment coming soon
          </button>
          <p className="mt-3 text-center text-xs text-foreground-muted">
            Secure online payment is being connected in an upcoming phase. Your
            order total will always be recalculated and verified on our
            server before any payment is taken.
          </p>
        </div>
      </form>
    </Container>
  );
}
