import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db/connect";
import { ArticleModel } from "@/lib/db/models/Article";
import { getArticleBySlug } from "@/lib/db/articles";
import { recordAuditEvent } from "@/lib/db/audit";
import { updateArticleSchema } from "@/lib/validation/article";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ article });
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
  const parsed = updateArticleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();
  const updated = await ArticleModel.findOneAndUpdate({ slug }, parsed.data, {
    returnDocument: "after",
  }).lean();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOnlyStatusChange =
    Object.keys(parsed.data).length === 1 && parsed.data.status !== undefined;
  await recordAuditEvent({
    entityType: "article",
    entityLabel: updated.title,
    action: isOnlyStatusChange
      ? parsed.data.status === "published"
        ? "publish"
        : "unpublish"
      : "update",
    actor: session.user?.email ?? "admin",
  });

  return NextResponse.json({ article: updated });
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
  const existing = await ArticleModel.findOne({ slug }).lean();
  const result = await ArticleModel.deleteOne({ slug });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await recordAuditEvent({
    entityType: "article",
    entityLabel: existing?.title ?? slug,
    action: "delete",
    actor: session.user?.email ?? "admin",
  });

  return NextResponse.json({ ok: true });
}
