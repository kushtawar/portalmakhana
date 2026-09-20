import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { parseDocument } from "@/lib/media/parseDocument";
import { uploadPublicMediaBuffer } from "@/lib/media/s3";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const parsed = await parseDocument(file);

    let coverImageUrl: string | undefined;
    if (parsed.coverImage) {
      const { url } = await uploadPublicMediaBuffer(
        "articles",
        parsed.coverImage.data,
        parsed.coverImage.contentType
      ).catch(() => ({ url: undefined }));
      coverImageUrl = url;
    }

    return NextResponse.json({
      title: parsed.title,
      excerpt: parsed.excerpt,
      content: parsed.content,
      coverImageUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not read this document";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
