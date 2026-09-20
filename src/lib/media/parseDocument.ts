import "server-only";
import mammoth from "mammoth";

export interface ParsedDocument {
  title: string;
  excerpt: string;
  content: string[];
  coverImage?: { data: Buffer; contentType: string };
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

function toExcerpt(paragraphs: string[]): string {
  const first = paragraphs[0] ?? "";
  return first.length > 200 ? `${first.slice(0, 197)}...` : first;
}

async function parseDocx(buffer: Buffer): Promise<ParsedDocument> {
  let coverImage: ParsedDocument["coverImage"];

  const result = await mammoth.convertToHtml(
    { buffer },
    {
      convertImage: mammoth.images.imgElement(async (image) => {
        if (!coverImage) {
          const base64 = await image.read("base64");
          coverImage = { data: Buffer.from(base64, "base64"), contentType: image.contentType };
        }
        return { src: "" };
      }),
    }
  );

  const html = result.value;
  const headingMatch = html.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/i);
  const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => stripTags(m[1]))
    .filter(Boolean);

  const title = headingMatch ? stripTags(headingMatch[1]) : (paragraphs[0]?.slice(0, 80) ?? "Untitled");
  const content = headingMatch ? paragraphs : paragraphs.slice(1);
  const finalContent = content.length ? content : paragraphs;

  return { title, excerpt: toExcerpt(finalContent), content: finalContent, coverImage };
}

async function parsePdf(buffer: Buffer): Promise<ParsedDocument> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const { text } = await parser.getText();
  await parser.destroy();

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p: string) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const title = paragraphs[0]?.slice(0, 80) ?? "Untitled";
  const content = paragraphs.slice(1);
  const finalContent = content.length ? content : paragraphs;

  return { title, excerpt: toExcerpt(finalContent), content: finalContent };
}

const DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function parseDocument(file: File): Promise<ParsedDocument> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === DOCX_TYPE) return parseDocx(buffer);
  if (file.type === "application/pdf") return parsePdf(buffer);

  throw new Error("Unsupported file type. Upload a .docx or .pdf file.");
}
