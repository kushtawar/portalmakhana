import "server-only";
import { createRequire } from "node:module";
import mammoth from "mammoth";

const require = createRequire(import.meta.url);

// pdf-parse's bundled pdfjs-dist keeps mutable state across getDocument()
// calls that never gets reset between documents - parsing two different
// PDFs in the same warm process (exactly what a reused serverless
// container does across separate uploads) corrupts the second one with
// spurious errors like "bad XRef entry", even though the file is fine on
// its own. Verified: dropping its require-cache entries before each call
// forces a full reinitialization and eliminates the corruption.
function freshPdfParse(): (buffer: Buffer) => Promise<{ text: string }> {
  for (const key of Object.keys(require.cache)) {
    if (key.includes("pdf-parse") || key.includes("pdfjs-dist")) {
      delete require.cache[key];
    }
  }
  // Require the internal lib file directly (a literal string, not a
  // resolved path variable - bundlers can't trace a dynamic require target,
  // even for a package marked external), not the package root: index.js
  // runs a debug self-test (reads a sample PDF from disk) whenever it
  // detects no CommonJS parent module, which would otherwise always be
  // true here.
  return require("pdf-parse/lib/pdf-parse.js");
}

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

// PDFs often repeat a header/footer line (branding, page title) on every
// page. pdf-parse has no concept of this - it just extracts text in reading
// order - so a verbatim line seen 2+ times is almost certainly one of these
// and gets dropped before anything else runs.
function stripRepeatedLines(text: string): string {
  const lines = text.split("\n").map((l) => l.trim());
  const counts = new Map<string, number>();
  for (const line of lines) {
    if (line) counts.set(line, (counts.get(line) ?? 0) + 1);
  }
  const repeated = new Set(
    [...counts.entries()].filter(([line, count]) => count >= 2 && line.length < 120).map(([line]) => line)
  );
  return lines.filter((line) => !repeated.has(line)).join("\n");
}

// A line reads as a heading if it's short, doesn't trail off with sentence
// punctuation, and is mostly Title-Cased ("Why Processing Matters") or a
// numbered section ("3. Heating and Tempering").
function looksLikeHeading(line: string): boolean {
  if (/^\d+\.\s+[A-Z]/.test(line)) return true;
  if (line.length > 60 || /[.,;:]$/.test(line)) return false;
  const words = line.split(/\s+/).filter(Boolean);
  if (words.length < 2) return false;
  const capitalized = words.filter((w) => /^[A-Z]/.test(w));
  return capitalized.length / words.length >= 0.7;
}

const MAX_PARAGRAPH_LENGTH = 500;

function splitIfTooLong(block: string): string[] {
  if (block.length <= MAX_PARAGRAPH_LENGTH) return [block];
  const sentences = block.match(/[^.!?]+[.!?]+(?:\s+|$)/g) ?? [block];
  const result: string[] = [];
  let buffer = "";
  for (const sentence of sentences) {
    if (buffer && (buffer + sentence).length > MAX_PARAGRAPH_LENGTH) {
      result.push(buffer.trim());
      buffer = "";
    }
    buffer += sentence;
  }
  if (buffer.trim()) result.push(buffer.trim());
  return result;
}

// pdf-parse gives no paragraph structure, only line breaks - a document
// whose paragraphs aren't separated by a literal blank line (common in PDFs
// exported from templates with numbered/titled sections) would otherwise
// collapse into one giant block on a naive blank-line split. Start a new
// paragraph at every blank line AND at every heading-like line, then, for
// whatever is still an unreasonably long block, fall back to grouping by a
// handful of sentences at a time so nothing renders as one wall of text.
function splitIntoParagraphs(text: string): string[] {
  const lines = text.split("\n").map((l) => l.trim());
  const paragraphs: string[] = [];
  let current = "";

  for (const line of lines) {
    const isBlank = line === "";
    if ((isBlank || looksLikeHeading(line)) && current) {
      paragraphs.push(current.trim());
      current = "";
    }
    if (!isBlank) current += (current ? " " : "") + line;
  }
  if (current.trim()) paragraphs.push(current.trim());

  return paragraphs.filter(Boolean).flatMap(splitIfTooLong);
}

async function parsePdf(buffer: Buffer): Promise<ParsedDocument> {
  const pdfParse = freshPdfParse();
  const { text } = await pdfParse(buffer);

  const cleanedText = stripRepeatedLines(text);
  const paragraphs = splitIntoParagraphs(cleanedText);

  const firstIsShortHeading = (paragraphs[0]?.length ?? 0) < 100;
  const title = (firstIsShortHeading ? paragraphs[0] : paragraphs[0]?.slice(0, 80)) ?? "Untitled";
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
