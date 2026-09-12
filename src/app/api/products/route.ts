import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db/connect";
import { ProductModel } from "@/lib/db/models/Product";
import { listProducts } from "@/lib/db/products";
import { recordAuditEvent } from "@/lib/db/audit";
import { createProductSchema } from "@/lib/validation/product";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const q = searchParams.get("q") ?? undefined;

  const session = await auth();
  const isAdmin = Boolean(session);

  const products = await listProducts({
    category,
    q,
    activeOnly: !isAdmin,
  });

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();

  const existing = await ProductModel.findOne({ slug: parsed.data.slug }).lean();
  if (existing) {
    return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
  }

  const created = await ProductModel.create(parsed.data);
  await recordAuditEvent({
    entityType: "product",
    entityLabel: parsed.data.name,
    action: "create",
    actor: session.user?.email ?? "admin",
  });
  return NextResponse.json({ product: { id: String(created._id), ...parsed.data } }, { status: 201 });
}
