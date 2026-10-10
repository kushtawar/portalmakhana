// Replaces the old brand name "ItarIntakes" with "PatnaMakhana" in text stored in the
// database (product details, articles, banners, promotions), including article slugs that
// contain it. Text rules are in scripts/lib/rebrand.ts.
//
// Preview (default, read-only — lists every change it would make):
//   node --env-file=<env file> --import tsx scripts/rebrand-database-text.ts
// Apply (writes exactly the previewed changes, all in one transaction):
//   node --env-file=<env file> --import tsx scripts/rebrand-database-text.ts --apply --db=<database>
//
// Safety:
// - Only the four collections below, in the database named in MONGODB_URI (confirmed by --db).
// - Only string values change; numbers (prices, stock, GST), ids, dates and URLs never do.
// - Audit events and product versions are history and are never touched.
// - A slug rename is refused if the new slug is already taken.
// - All writes happen in one transaction: either every change is saved or none is.
// - Re-running is safe: once applied, the preview reports 0 changes.

import mongoose from "mongoose";
import { planTextChanges, type TextChange } from "./lib/rebrand";
import { assertConnectedDatabase, resolveScriptTarget } from "./lib/targetDatabase";

const COLLECTIONS = ["products", "articles", "banners", "promotions"] as const;

interface PlannedDoc {
  collection: (typeof COLLECTIONS)[number];
  id: mongoose.Types.ObjectId;
  label: string;
  changes: TextChange[];
}

async function run() {
  const target = resolveScriptTarget(process.argv, process.env.MONGODB_URI);

  await mongoose.connect(process.env.MONGODB_URI!);
  const db = mongoose.connection.db!;
  assertConnectedDatabase(target, db.databaseName);
  console.log(`Database: ${db.databaseName} · mode: ${target.apply ? "APPLY" : "preview"}\n`);

  // 1. Plan every change (read-only).
  const planned: PlannedDoc[] = [];
  for (const collection of COLLECTIONS) {
    for (const doc of await db.collection(collection).find({}).toArray()) {
      const changes = planTextChanges(doc);
      if (changes.length === 0) continue;
      planned.push({
        collection,
        id: doc._id,
        label: String(doc.slug ?? doc.name ?? doc.headline ?? doc.title ?? ""),
        changes,
      });
    }
  }

  for (const doc of planned) {
    console.log(`${doc.collection} ${doc.id} (${doc.label})`);
    for (const { path, before, after } of doc.changes) {
      console.log(`  ${path}: ${JSON.stringify(before).slice(0, 100)} → ${JSON.stringify(after).slice(0, 100)}`);
    }
  }

  // 2. Pre-flight: every renamed slug must be free (the slug indexes are unique).
  const conflicts: string[] = [];
  for (const doc of planned) {
    for (const change of doc.changes.filter((c) => c.path === "slug")) {
      const taken = await db.collection(doc.collection).countDocuments({ slug: change.after, _id: { $ne: doc.id } });
      if (taken > 0) conflicts.push(`${doc.collection}: slug "${change.after}" already exists`);
    }
  }

  const total = planned.reduce((sum, doc) => sum + doc.changes.length, 0);
  console.log(`\n${total} text value(s) in ${planned.length} document(s) ${target.apply ? "to update" : "would be updated"}.`);
  if (conflicts.length) {
    console.log(`\nBlocked — resolve these first:\n  ${conflicts.join("\n  ")}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  // 3. Apply, atomically.
  if (!target.apply) {
    console.log("Preview only — nothing was written. Re-run with --apply --db=<database> to write.");
  } else if (planned.length > 0) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        for (const doc of planned) {
          const set = Object.fromEntries(doc.changes.map((c) => [c.path, c.after]));
          // Match on the old values too, so a document edited since the preview is not overwritten.
          const unchanged = Object.fromEntries(doc.changes.map((c) => [c.path, c.before]));
          const result = await db
            .collection(doc.collection)
            .updateOne({ _id: doc.id, ...unchanged }, { $set: set }, { session });
          if (result.matchedCount !== 1) {
            throw new Error(`${doc.collection} ${doc.id} changed since the preview — re-run the preview`);
          }
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
