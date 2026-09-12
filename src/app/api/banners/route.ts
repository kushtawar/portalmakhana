import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { BannerModel } from "@/lib/db/models/Banner";
import { connectToDatabase } from "@/lib/db/connect";
import { listBanners } from "@/lib/db/banners";
import { createBannerSchema } from "@/lib/validation/banner";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const banners = await listBanners();
  return NextResponse.json({ banners });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createBannerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();
  const created = await BannerModel.create(parsed.data);
  return NextResponse.json({ banner: { id: String(created._id), ...parsed.data } }, { status: 201 });
}
