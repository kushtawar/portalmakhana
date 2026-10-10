// The article redirect map must match what the database rebrand script will rename.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ARTICLE_SLUG_RENAMES, legacySlugFor } from "../src/lib/articleSlugRenames";
import { replaceBrand } from "../scripts/lib/rebrand";

describe("article slug renames", () => {
  it("each new slug is exactly what the rebrand script produces from the old one", () => {
    for (const [from, to] of Object.entries(ARTICLE_SLUG_RENAMES)) {
      assert.equal(replaceBrand(from), to);
      assert.notEqual(from, to);
    }
  });

  it("maps a new slug back to its pre-rebrand slug, and nothing else", () => {
    assert.equal(legacySlugFor("patnamakhana-now-ships-pan-india"), "itarintakes-now-ships-pan-india");
    assert.equal(legacySlugFor("itarintakes-now-ships-pan-india"), undefined);
    assert.equal(legacySlugFor("how-to-enjoy-makhana"), undefined);
  });
});
