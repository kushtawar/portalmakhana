import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db/connect";
import { PromotionModel } from "@/lib/db/models/Promotion";
import { getPromotionBySlug } from "@/lib/db/promotions";
import { recordAuditEvent } from "@/lib/db/audit";
import { updatePromotionSchema } from "@/lib/validation/promotion";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const promotion = await getPromotionBySlug(slug);
  if (!promotion) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ promotion });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updatePromotionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();
  const updated = await PromotionModel.findOneAndUpdate({ slug }, parsed.data, {
    returnDocument: "after",
  }).lean();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOnlyActiveToggle =
    Object.keys(parsed.data).length === 1 && parsed.data.active !== undefined;
  await recordAuditEvent({
    entityType: "promotion",
    entityLabel: updated.title,
    action: isOnlyActiveToggle ? (parsed.data.active ? "activate" : "deactivate") : "update",
    actor: session.user?.email ?? "admin",
  });

  return NextResponse.json({ promotion: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  await connectToDatabase();
  const existing = await PromotionModel.findOne({ slug }).lean();
  const result = await PromotionModel.deleteOne({ slug });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await recordAuditEvent({
    entityType: "promotion",
    entityLabel: existing?.title ?? slug,
    action: "delete",
    actor: session.user?.email ?? "admin",
  });

  return NextResponse.json({ ok: true });
}
