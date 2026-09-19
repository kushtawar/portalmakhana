import Link from "next/link";
import { getActivePromotion } from "@/lib/db/promotions";
import Container from "@/components/layout/Container";

export default async function PromotionBanner() {
  const promotion = await getActivePromotion();
  if (!promotion) return null;

  return (
    <Link
      href={`/offers/${promotion.slug}`}
      className={`relative block bg-gradient-to-r from-accent to-primary-deep text-white transition-opacity hover:opacity-95 ${
        promotion.blinkBanner ? "promo-banner" : ""
      }`}
    >
      <Container className="relative flex items-center justify-center gap-2 py-2 text-center text-sm font-medium">
        <span aria-hidden>🎉</span>
        <span className="truncate">{promotion.bannerText}</span>
        <span className="shrink-0 underline">View offer &rarr;</span>
      </Container>
    </Link>
  );
}
