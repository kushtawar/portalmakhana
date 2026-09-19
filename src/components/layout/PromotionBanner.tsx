import Link from "next/link";
import { getActivePromotion } from "@/lib/db/promotions";
import Container from "@/components/layout/Container";

export default async function PromotionBanner() {
  const promotion = await getActivePromotion();
  if (!promotion) return null;

  return (
    <Link
      href={`/offers/${promotion.slug}`}
      className="promo-banner relative block overflow-hidden bg-gradient-to-r from-accent to-primary-deep text-white transition-opacity hover:opacity-95"
    >
      <span
        aria-hidden
        className="promo-shimmer pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-white/25"
      />
      <Container className="relative flex items-center justify-center gap-2 py-2 text-center text-sm font-medium">
        <span aria-hidden className="animate-bounce">
          🎉
        </span>
        <span className="truncate">{promotion.bannerText}</span>
        <span className="shrink-0 underline">View offer &rarr;</span>
      </Container>
    </Link>
  );
}
