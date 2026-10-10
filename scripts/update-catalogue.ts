// Brings the products collection in line with the business's 13-product catalogue
// (src/lib/data/products.ts): names, pack weights, pack prices and rates per kg.
//
// Preview (default, read-only — lists every change):
//   node --env-file=<env file> --import tsx scripts/update-catalogue.ts
// Apply (writes exactly the previewed changes, in one transaction):
//   node --env-file=<env file> --import tsx scripts/update-catalogue.ts --apply --db=<database>
//
// For each catalogue product, matched by slug:
// - Existing product: updates name, image label, grade, category, the pack (label, price,
//   SKU — stock is kept), the "Net weight", "Price per kg" and "Type" details, and the
//   Haldi/Dhania descriptions. Everything else is kept: GST, stock, photos, other
//   descriptions, Featured/Bestseller, archive status and other details.
//   Rules: scripts/lib/catalogue.ts.
// - Missing product: inserted, with a placeholder photo to replace in the admin.
// Products not in the catalogue that are still live are archived (never deleted).
// The "how our grades differ" article's per-kg prices are updated to match.
// Only the `products` and `articles` collections of the named database are touched.

import mongoose from "mongoose";
import { products as catalogue } from "@/lib/data/products";
import { buildInsert, planProductUpdate } from "./lib/catalogue";
import { assertConnectedDatabase, resolveScriptTarget } from "./lib/targetDatabase";

const GRADES_ARTICLE = "how-our-makhana-grades-differ";
const ARTICLE_PRICE_FIXES: [string, string][] = [
  ["Silver (₹900/kg)", "Silver (₹800/kg)"],
  ["Gold (₹1,000/kg)", "Gold (₹940/kg)"],
];

type Doc = Record<string, unknown> & { _id: mongoose.Types.ObjectId };
type Variant = { label: string; price: number };

interface Plan {
  updates: { id: mongoose.Types.ObjectId; slug: string; set: Record<string, unknown>; before: Record<string, unknown> }[];
  inserts: Record<string, unknown>[];
  archives: { id: mongoose.Types.ObjectId; slug: string; name: string }[];
  article: { id: mongoose.Types.ObjectId; content: string[]; before: string[] } | null;
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

async function run() {
  const target = resolveScriptTarget(process.argv, process.env.MONGODB_URI);
  await mongoose.connect(process.env.MONGODB_URI!);
  const db = mongoose.connection.db!;
  assertConnectedDatabase(target, db.databaseName);
  console.log(`Database: ${db.databaseName} · mode: ${target.apply ? "APPLY" : "preview"}\n`);

  const productsCol = db.collection<Doc>("products");
  const articlesCol = db.collection<Doc>("articles");
  const existing = await productsCol.find({}).toArray();
  const bySlug = new Map(existing.map((d) => [String(d.slug), d]));
  const catalogueSlugs = new Set(catalogue.map((p) => p.slug));

  const plan: Plan = { updates: [], inserts: [], archives: [], article: null };
  const now = new Date();

  for (const wanted of catalogue) {
    const current = bySlug.get(wanted.slug);
    if (current) {
      const { set, before } = planProductUpdate(current, wanted);
      if (Object.keys(set).length) plan.updates.push({ id: current._id, slug: wanted.slug, set, before });
      if (current.active === false) console.log(`Note: ${wanted.slug} is archived — left archived.`);
    } else {
      plan.inserts.push(buildInsert(wanted, now));
    }
  }
  for (const doc of existing) {
    if (!catalogueSlugs.has(String(doc.slug)) && doc.active !== false) {
      plan.archives.push({ id: doc._id, slug: String(doc.slug), name: String(doc.name) });
    }
  }

  const article = await articlesCol.findOne({ slug: GRADES_ARTICLE });
  if (article && Array.isArray(article.content)) {
    const content = (article.content as string[]).map((p) =>
      ARTICLE_PRICE_FIXES.reduce((text, [from, to]) => text.split(from).join(to), p)
    );
    if (!same(content, article.content)) {
      plan.article = { id: article._id, content, before: article.content as string[] };
    }
  }

  // Report.
  for (const u of plan.updates) {
    console.log(`UPDATE ${u.slug}`);
    for (const key of Object.keys(u.set)) {
      console.log(`  ${key}: ${JSON.stringify(u.before[key]).slice(0, 160)}\n    → ${JSON.stringify(u.set[key]).slice(0, 160)}`);
    }
  }
  for (const doc of plan.inserts) {
    const v = (doc.variants as Variant[])[0];
    console.log(`INSERT ${doc.slug}: "${doc.name}" · ${v.label} ₹${v.price} · ${doc.category} · photo ${doc.imagePath}`);
  }
  for (const a of plan.archives) console.log(`ARCHIVE ${a.slug} ("${a.name}") — not in the catalogue; kept, hidden from the shop`);
  if (plan.article) {
    plan.article.content.forEach((text, i) => {
      if (text !== plan.article!.before[i]) console.log(`ARTICLE ${GRADES_ARTICLE} content.${i}:\n    ${plan.article!.before[i]}\n  → ${text}`);
    });
  }
  console.log(
    `\n${plan.updates.length} update(s), ${plan.inserts.length} insert(s), ${plan.archives.length} archive(s), ${plan.article ? 1 : 0} article fix ${target.apply ? "to apply" : "would be made"}.`
  );

  if (!target.apply) {
    console.log("Preview only — nothing was written. Re-run with --apply --db=<database> to write.");
  } else {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        for (const u of plan.updates) {
          // Only matches if the fields are still as previewed.
          const result = await productsCol.updateOne(
            { _id: u.id, ...Object.fromEntries(Object.entries(u.before).map(([k, v]) => [k, v === undefined ? { $exists: false } : v])) },
            { $set: { ...u.set, updatedAt: now } },
            { session }
          );
          if (result.matchedCount !== 1) throw new Error(`${u.slug} changed since the preview — re-run the preview`);
        }
        for (const doc of plan.inserts) {
          if (await productsCol.countDocuments({ slug: doc.slug }, { session })) {
            throw new Error(`${doc.slug} already exists — re-run the preview`);
          }
          await productsCol.insertOne(doc as Doc, { session });
        }
        for (const a of plan.archives) {
          await productsCol.updateOne({ _id: a.id, active: { $ne: false } }, { $set: { active: false, updatedAt: now } }, { session });
        }
        if (plan.article) {
          const result = await articlesCol.updateOne(
            { _id: plan.article.id, content: plan.article.before },
            { $set: { content: plan.article.content, updatedAt: now } },
            { session }
          );
          if (result.matchedCount !== 1) throw new Error(`${GRADES_ARTICLE} changed since the preview — re-run the preview`);
        }
      });
      console.log("Applied in one transaction.");
    } finally {
      await session.endSession();
    }
  }

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("Failed — nothing was written:", error instanceof Error ? error.message : error);
  await mongoose.disconnect();
  process.exit(1);
});
