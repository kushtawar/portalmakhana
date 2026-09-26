import Image from "next/image";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { HERO_DEFAULTS } from "@/lib/data/heroDefaults";
import { getActiveBanner } from "@/lib/db/banners";

const STATS = [
  { value: "3 Grades", label: "Silver · Gold · Diamond" },
  { value: "Handpicked", label: "Gold & Diamond option" },
  { value: "250 g", label: "Makhana packs" },
  { value: "Hygienic", label: "Packaging" },
];

// Small packets shown beside the main banner image to present the range.
const RANGE = [
  { label: "Silver", slug: "shrestha-silver-makhana" },
  { label: "Gold", slug: "shrestha-gold-makhana" },
  { label: "Diamond", slug: "shrestha-diamond-makhana" },
];

const BADGES = [
  { label: "Quality Selection", icon: "leaf" as const },
  { label: "Customer Trust", icon: "heart" as const },
  { label: "Hygienic Packaging", icon: "globe" as const },
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

function HeroBadge({ badge }: { badge: (typeof BADGES)[number] }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/95 py-1.5 pl-1.5 pr-4 shadow-md ring-1 ring-black/5">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
          <BadgeIcon icon={badge.icon} />
        </svg>
      </span>
      <span className="text-xs font-semibold text-primary-dark">{badge.label}</span>
    </div>
  );
}

export default async function Hero() {
  const banner = await getActiveBanner("home-hero");

  const eyebrow = banner?.eyebrow || HERO_DEFAULTS.eyebrow;
  const headline = banner?.headline || HERO_DEFAULTS.headline;
  const subtext = banner?.subtext || HERO_DEFAULTS.subtext;
  const ctaLabel = banner?.ctaLabel || HERO_DEFAULTS.ctaLabel;
  const ctaHref = banner?.ctaHref || HERO_DEFAULTS.ctaHref;
  const imagePath = banner?.imagePath || HERO_DEFAULTS.imagePath;

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
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-md ring-2 ring-accent/30 ring-offset-2 ring-offset-background transition hover:-translate-y-0.5 hover:shadow-lg"
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
              <span aria-hidden>&rarr;</span>
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

        <div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-primary-deep shadow-lg">
            {/* Blurred copy of the banner fills the panel so it never looks empty. */}
            <Image
              src={imagePath}
              alt=""
              aria-hidden
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="scale-125 object-cover opacity-70 blur-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary-deep/70 via-primary-deep/20 to-primary-deep/70" />
            {/* "lighten" drops a photo's black studio background into the backdrop. */}
            {/* Main image sits between the range packets (left) and the badges (right). */}
            <div className="absolute inset-y-3 left-3 right-3 sm:left-24 lg:right-48">
              <Image
                src={imagePath}
                alt="Shrestha Makhana packaging"
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-contain mix-blend-lighten drop-shadow-2xl"
              />
            </div>

            <div className="absolute inset-y-0 left-4 hidden flex-col justify-center gap-2 sm:flex">
              {RANGE.map((item) => (
                <Link
                  key={item.slug}
                  href={`/shop/${item.slug}`}
                  className="group flex flex-col items-center rounded-xl p-1.5 ring-1 ring-white/25 transition hover:ring-white/60"
                >
                  <span className="relative block h-16 w-16">
                    <Image
                      src={`/products/${item.slug}.jpg`}
                      alt={`Shrestha ${item.label} Makhana`}
                      fill
                      sizes="64px"
                      className="object-contain mix-blend-lighten transition group-hover:scale-105"
                    />
                  </span>
                  <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>

            <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
              {BADGES.map((badge) => (
                <HeroBadge key={badge.label} badge={badge} />
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2 lg:hidden">
            {BADGES.map((badge) => (
              <HeroBadge key={badge.label} badge={badge} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
