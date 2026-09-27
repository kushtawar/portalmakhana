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

export const BADGES = [
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

export function HeroBadge({ badge }: { badge: (typeof BADGES)[number] }) {
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

const SCENE_IMAGE = "/products/hero-scene.jpg";

// Where the Silver/Gold/Diamond cards sit inside SCENE_IMAGE (as % of the image),
// so invisible links can be laid exactly over them.
const SCENE_RANGE_LINKS = [
  { label: "Silver", slug: "shrestha-silver-makhana", top: "16%" },
  { label: "Gold", slug: "shrestha-gold-makhana", top: "40.1%" },
  { label: "Diamond", slug: "shrestha-diamond-makhana", top: "64.4%" },
];

// Compact stacked badge used inside the image box, where horizontal space is tight.
function HeroBadgeCompact({ badge }: { badge: (typeof BADGES)[number] }) {
  return (
    <div className="flex w-[6.25rem] flex-col items-center gap-1 rounded-xl bg-white/95 px-1.5 py-1.5 text-center shadow-md ring-1 ring-black/5">
      <span className="flex h-7 w-7 items-center justify-center rounded-full border-[1.5px] border-primary text-primary">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
          <BadgeIcon icon={badge.icon} />
        </svg>
      </span>
      <span className="text-[11px] font-semibold leading-tight text-primary-dark">{badge.label}</span>
    </div>
  );
}

export function HeroContent({
  eyebrow,
  headline,
  subtext,
  ctaLabel,
  ctaHref,
}: {
  eyebrow: string;
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <section className="bg-gradient-to-b from-background-subtle to-background">
      <Container className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-primary-dark sm:text-5xl">
            {headline}{"\u00a0"}<span aria-hidden>🍃</span>
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

          <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-2 xl:gap-x-10">
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
          <div className="relative aspect-[5/3] w-full overflow-hidden rounded-2xl shadow-lg">
            <Image
              src={SCENE_IMAGE}
              alt="Shrestha Handpicked Diamond Makhana with Silver, Gold and Diamond packs"
              fill
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
            {SCENE_RANGE_LINKS.map((item) => (
              <Link
                key={item.slug}
                href={`/shop/${item.slug}`}
                aria-label={`Shrestha ${item.label} Makhana`}
                style={{ top: item.top }}
                className="absolute left-[3.4%] h-[22.2%] w-[13.4%] rounded-xl transition hover:-translate-y-0.5 hover:shadow-xl hover:ring-2 hover:ring-white focus-visible:ring-2 focus-visible:ring-white"
              />
            ))}
            {/* Near-centred, but kept above the packet's bulging bottom-right corner. */}
            <div className="absolute right-2 top-[18%] hidden flex-col gap-1.5 xl:flex">
              {BADGES.map((badge) => (
                <HeroBadgeCompact key={badge.label} badge={badge} />
              ))}
            </div>
          </div>

          {/* Below xl the box is too small for the in-image badges. */}
          <div className="mt-4 flex flex-wrap justify-center gap-2 xl:hidden">
            {BADGES.map((badge) => (
              <HeroBadge key={badge.label} badge={badge} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default async function Hero() {
  const banner = await getActiveBanner("home-hero");

  return (
    <HeroContent
      eyebrow={banner?.eyebrow || HERO_DEFAULTS.eyebrow}
      headline={banner?.headline || HERO_DEFAULTS.headline}
      subtext={banner?.subtext || HERO_DEFAULTS.subtext}
      ctaLabel={banner?.ctaLabel || HERO_DEFAULTS.ctaLabel}
      ctaHref={banner?.ctaHref || HERO_DEFAULTS.ctaHref}
    />
  );
}
