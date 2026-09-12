import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db/connect";
import { PromotionModel } from "@/lib/db/models/Promotion";
import { listPromotions } from "@/lib/db/promotions";
import { createPromotionSchema } from "@/lib/validation/promotion";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const promotions = await listPromotions();
  return NextResponse.json({ promotions });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createPromotionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();

  const existing = await PromotionModel.findOne({ slug: parsed.data.slug }).lean();
  if (existing) {
    return NextResponse.json(
      { error: "A promotion with this slug already exists" },
      { status: 409 }
    );
  }

  const created = await PromotionModel.create(parsed.data);
  return NextResponse.json(
    { promotion: { id: String(created._id), ...parsed.data } },
    { status: 201 }
  );
}
