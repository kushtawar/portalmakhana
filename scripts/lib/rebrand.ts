// Pure text-rewriting rules for scripts/rebrand-database-text.ts (unit-tested in tests/).

export const BRAND = "PatnaMakhana";
const PATTERN = /itar ?intakes/gi;

/**
 * Replace the old brand in one string.
 * - URLs (http/https) are never changed: the S3 media bucket is named "itarintakes", so
 *   rewriting image links would break every uploaded image.
 * - Identifiers and paths (no whitespace, old name written in lowercase, e.g. slugs or
 *   "/stories/itarintakes-…") stay lowercase, as URLs require.
 * - Everywhere else the brand is written exactly as "PatnaMakhana".
 */
export function replaceBrand(text: string): string {
  if (/^https?:\/\//i.test(text)) return text;
  const isIdentifier = !/\s/.test(text);
  return text.replace(PATTERN, (match) =>
    isIdentifier && match === match.toLowerCase() ? BRAND.toLowerCase() : BRAND
  );
}

export interface TextChange {
  path: string;
  before: string;
  after: string;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Every string inside a document that would change, as dotted paths (e.g.
 * "attributes.0.value"). Only plain objects and arrays are walked, so ObjectIds, Dates and
 * other BSON values are never touched; `_id` is skipped.
 */
export function planTextChanges(doc: Record<string, unknown>): TextChange[] {
  const changes: TextChange[] = [];
  const walk = (value: unknown, path: string) => {
    if (typeof value === "string") {
      const after = replaceBrand(value);
      if (after !== value) changes.push({ path, before: value, after });
    } else if (Array.isArray(value)) {
      value.forEach((item, i) => walk(item, `${path}.${i}`));
    } else if (isPlainObject(value)) {
      for (const [key, item] of Object.entries(value)) {
        if (path === "" && key === "_id") continue;
        walk(item, path ? `${path}.${key}` : key);
      }
    }
  };
  walk(doc, "");
  return changes;
}
