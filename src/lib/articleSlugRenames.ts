// Article slugs renamed by the PatnaMakhana rebrand (old → new). Single source of truth for
// the permanent redirects in next.config.ts and the temporary lookup fallback in
// getArticleBySlugOrLegacy. No imports, so next.config.ts can load it directly.
//
// Once scripts/rebrand-database-text.ts has been applied in production, the fallback is
// dead code and can be removed; keep the redirects (old URLs may be bookmarked or indexed).
export const ARTICLE_SLUG_RENAMES: Record<string, string> = {
  "itarintakes-now-ships-pan-india": "patnamakhana-now-ships-pan-india",
  "itarintakes-makhana-knowledge-article-itarintakes-knowledge-series-how-makhana":
    "patnamakhana-makhana-knowledge-article-patnamakhana-knowledge-series-how-makhana",
};

/** The pre-rebrand slug for a renamed article, if `slug` is one of the new slugs. */
export function legacySlugFor(slug: string): string | undefined {
  return Object.keys(ARTICLE_SLUG_RENAMES).find((old) => ARTICLE_SLUG_RENAMES[old] === slug);
}
