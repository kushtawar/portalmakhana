import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/layout/Container";
import { getPromotionBySlug } from "@/lib/db/promotions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const promotion = await getPromotionBySlug(slug);
  if (!promotion) return {};
  return {
    title: promotion.title,
    description: promotion.bannerText,
  };
}

export default async function OfferPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const promotion = await getPromotionBySlug(slug);
  if (!promotion) notFound();

  // Server Component executed once per request: reading the current time
  // here is intentional (checking whether the offer window is live now).
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const start = new Date(promotion.startAt).getTime();
  const end = new Date(promotion.endAt).getTime();
  const isUpcoming = now < start;
  const isExpired = now > end;

  return (
    <Container className="max-w-2xl py-16 text-center">
      {!promotion.active || isUpcoming || isExpired ? (
        <p className="mb-4 inline-block rounded-full bg-muted px-4 py-1.5 text-xs font-medium text-foreground-muted">
          {isUpcoming ? "This offer hasn't started yet" : "This offer has ended"}
        </p>
      ) : (
        <p className="mb-4 inline-block rounded-full bg-primary-light px-4 py-1.5 text-xs font-semibold text-primary-dark">
          Live now
        </p>
      )}

      <h1 className="font-display text-3xl font-semibold text-primary-dark sm:text-4xl">
        {promotion.title}
      </h1>
      <p className="mt-3 text-foreground-muted">{promotion.bannerText}</p>

      <div className="mt-8 whitespace-pre-line text-left text-sm leading-relaxed text-foreground-muted">
        {promotion.description}
      </div>

      {promotion.ctaLabel && promotion.ctaHref ? (
        <Link
          href={promotion.ctaHref}
          className="mt-8 inline-flex items-center rounded-full bg-gradient-to-r from-primary to-primary-deep px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
        >
          {promotion.ctaLabel}
        </Link>
      ) : null}
    </Container>
  );
}
