import "server-only";
import { connectToDatabase } from "@/lib/db/connect";
import { BannerModel, type BannerDoc } from "@/lib/db/models/Banner";
import type { Banner, BannerPlacement } from "@/lib/types";

function toBanner(doc: BannerDoc & { _id: unknown }): Banner {
  return {
    id: String(doc._id),
    placement: doc.placement,
    eyebrow: doc.eyebrow,
    headline: doc.headline,
    subtext: doc.subtext,
    ctaLabel: doc.ctaLabel,
    ctaHref: doc.ctaHref,
    imagePath: doc.imagePath,
    active: doc.active,
  };
}

export async function listBanners(): Promise<Banner[]> {
  await connectToDatabase();
  const docs = await BannerModel.find().sort({ updatedAt: -1 }).lean();
  return docs.map((doc) => toBanner(doc as BannerDoc & { _id: unknown }));
}

export async function getBannerById(id: string): Promise<Banner | null> {
  await connectToDatabase();
  const doc = await BannerModel.findById(id).lean();
  return doc ? toBanner(doc as BannerDoc & { _id: unknown }) : null;
}

export async function getActiveBanner(placement: BannerPlacement): Promise<Banner | null> {
  await connectToDatabase();
  const doc = await BannerModel.findOne({ placement, active: true })
    .sort({ updatedAt: -1 })
    .lean();
  return doc ? toBanner(doc as BannerDoc & { _id: unknown }) : null;
}
