import Link from "next/link";
import Container from "@/components/layout/Container";
import ProductImage from "@/components/product/ProductImage";
import { getActiveBanner } from "@/lib/db/banners";

const STATS = [
  { value: "10+", label: "Years of Experience" },
  { value: "Pan India", label: "Supply" },
  { value: "Global", label: "Exports" },
  { value: "Thousands", label: "Happy Customers" },
];

const BADGES = [
  { label: "A Healthier You", icon: "leaf" as const },
  { label: "Rooted in Patna", icon: "heart" as const },
  { label: "Loved Worldwide", icon: "globe" as const },
];

function BadgeIcon({ icon }: { icon: "leaf" | "heart" | "globe" }) {
  if (icon === "heart") {
    return (
      <path
        d="M12 20s-6.5-4.1-9-8.2C1.2 8.6 2.7 5 6 5c2 0 3.3 1.1 4 2 0 0 1 .5 2 0 .7-.9 2-2 4-2 3.3 0 4.8 3.6 3 6.8-2.5 4.1-9 8.2-9 8.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    );
  }
  if (icon === "globe") {
    return (
      <>
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M3.5 12h17M12 3.5c2.5 2.4 3.8 5.3 3.8 8.5s-1.3 6.1-3.8 8.5c-2.5-2.4-3.8-5.3-3.8-8.5S9.5 5.9 12 3.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </>
    );
  }
  return (
    <path
      d="M6 12c0-4 3-7.5 8-8 1 3 1 6-1 8.5-1.4 1.7-3.3 2.3-5 2.3M6 12c1.2 3 3.9 5 6.2 5m-6.2-5c-.3-1.6-.1-3.1.5-4.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

export default async function Hero() {
  const banner = await getActiveBanner("home-hero");

  const eyebrow = banner?.eyebrow || "Natural · Nutritious · From Patna";
  const headline = banner?.headline || "Premium Makhana from Patna";
  const subtext =
    banner?.subtext ||
    "Pure. Crunchy. Wholesome. Sourced from the fertile lands of Patna, our Makhana brings you the goodness of nature with 10+ years of trusted experience — supplying across India and to global markets.";
  const ctaLabel = banner?.ctaLabel || "Shop Now";
  const ctaHref = banner?.ctaHref || "/shop";
  const imagePath = banner?.imagePath || "/products/classic-roasted-makhana.jpg";

  return (
    <section className="bg-gradient-to-b from-background-subtle to-background">
      <Container className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-primary-dark sm:text-5xl">
            {headline} <span aria-hidden>🍃</span>
          </h1>
          <p className="mt-4 max-w-lg text-foreground-muted">{subtext}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-deep px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              {ctaLabel}
              <span aria-hidden>&rarr;</span>
            </Link>
            <Link
              href="/wholesale"
              className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-6 py-3 text-sm font-semibold text-primary-dark transition-colors hover:bg-primary-light"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
                <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="M3.5 19c.8-3 3-4.5 5.5-4.5s4.7 1.5 5.5 4.5M15 8.5A2.5 2.5 0 1 1 15 3.6M17.5 19c-.5-2-1.7-3.4-3.3-4.1"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              Wholesale Enquiry
            </Link>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-xl font-semibold text-primary-dark">
                  {stat.value}
                </dd>
                <p className="text-xs text-foreground-muted">{stat.label}</p>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <ProductImage
            imagePath={imagePath}
            packType="makhana"
            label="Premium Makhana"
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="aspect-[4/3] w-full rounded-2xl"
          />

          <div className="mt-6 flex justify-center gap-6 lg:absolute lg:-right-4 lg:top-1/2 lg:mt-0 lg:flex-col lg:justify-start lg:gap-4 lg:-translate-y-1/2">
            {BADGES.map((badge) => (
              <div key={badge.label} className="flex flex-col items-center gap-1.5 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-md">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
                    <BadgeIcon icon={badge.icon} />
                  </svg>
                </span>
                <p className="max-w-[5.5rem] text-[11px] font-medium text-foreground-muted">
                  {badge.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
