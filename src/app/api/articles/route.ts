import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db/connect";
import { ArticleModel } from "@/lib/db/models/Article";
import { listArticles } from "@/lib/db/articles";
import { recordAuditEvent } from "@/lib/db/audit";
import { createArticleSchema } from "@/lib/validation/article";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;

  const session = await auth();
  const isAdmin = Boolean(session);

  const articles = await listArticles({ category, publishedOnly: !isAdmin });
  return NextResponse.json({ articles });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createArticleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();

  const existing = await ArticleModel.findOne({ slug: parsed.data.slug }).lean();
  if (existing) {
    return NextResponse.json(
      { error: "An article with this slug already exists" },
      { status: 409 }
    );
  }

  const created = await ArticleModel.create(parsed.data);
  await recordAuditEvent({
    entityType: "article",
    entityLabel: parsed.data.title,
    action: parsed.data.status === "published" ? "publish" : "create",
    actor: session.user?.email ?? "admin",
  });
  return NextResponse.json(
    { article: { id: String(created._id), ...parsed.data } },
    { status: 201 }
  );
}
