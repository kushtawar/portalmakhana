import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db/connect";
import { ProductModel } from "@/lib/db/models/Product";
import { getProductBySlug } from "@/lib/db/products";
import { recordAuditEvent } from "@/lib/db/audit";
import { updateProductSchema } from "@/lib/validation/product";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ product });
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
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();
  const updated = await ProductModel.findOneAndUpdate({ slug }, parsed.data, {
    returnDocument: "after",
  }).lean();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOnlyActiveToggle =
    Object.keys(parsed.data).length === 1 && parsed.data.active !== undefined;
  await recordAuditEvent({
    entityType: "product",
    entityLabel: updated.name,
    action: isOnlyActiveToggle ? (parsed.data.active ? "activate" : "deactivate") : "update",
    actor: session.user?.email ?? "admin",
  });

  return NextResponse.json({ product: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const hard = searchParams.get("hard") === "true";

  await connectToDatabase();

  if (hard) {
    const existing = await ProductModel.findOne({ slug }).lean();
    const result = await ProductModel.deleteOne({ slug });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await recordAuditEvent({
      entityType: "product",
      entityLabel: existing?.name ?? slug,
      action: "delete",
      actor: session.user?.email ?? "admin",
    });
    return NextResponse.json({ ok: true });
  }

  const archived = await ProductModel.findOneAndUpdate(
    { slug },
    { active: false },
    { returnDocument: "after" }
  ).lean();

  if (!archived) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await recordAuditEvent({
    entityType: "product",
    entityLabel: archived.name,
    action: "deactivate",
    actor: session.user?.email ?? "admin",
  });

  return NextResponse.json({ product: archived });
}
