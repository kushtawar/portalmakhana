import "server-only";
import { connectToDatabase } from "@/lib/db/connect";
import { PromotionModel, type PromotionDoc } from "@/lib/db/models/Promotion";
import type { Promotion } from "@/lib/types";

function toPromotion(doc: PromotionDoc & { _id: unknown }): Promotion {
  return {
    id: String(doc._id),
    slug: doc.slug,
    title: doc.title,
    bannerText: doc.bannerText,
    description: doc.description,
    imagePath: doc.imagePath,
    ctaLabel: doc.ctaLabel,
    ctaHref: doc.ctaHref,
    startAt: doc.startAt.toISOString(),
    endAt: doc.endAt.toISOString(),
    active: doc.active,
  };
}

export async function listPromotions(): Promise<Promotion[]> {
  await connectToDatabase();
  const docs = await PromotionModel.find().sort({ createdAt: -1 }).lean();
  return docs.map((doc) => toPromotion(doc as PromotionDoc & { _id: unknown }));
}

export async function getPromotionBySlug(slug: string): Promise<Promotion | null> {
  await connectToDatabase();
  const doc = await PromotionModel.findOne({ slug }).lean();
  return doc ? toPromotion(doc as PromotionDoc & { _id: unknown }) : null;
}

export async function getActivePromotion(): Promise<Promotion | null> {
  await connectToDatabase();
  const now = new Date();
  const doc = await PromotionModel.findOne({
    active: true,
    startAt: { $lte: now },
    endAt: { $gte: now },
  })
    .sort({ createdAt: -1 })
    .lean();
  return doc ? toPromotion(doc as PromotionDoc & { _id: unknown }) : null;
}
