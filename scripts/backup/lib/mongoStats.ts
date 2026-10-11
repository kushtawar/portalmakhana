// Read-only collection statistics: names, exact document counts, index definitions and a
// content fingerprint.

import { createHash } from "node:crypto";
import mongoose, { type mongo } from "mongoose";
import { normalizeIndex, type CollectionStats } from "./verify";

type Db = mongo.Db;

export async function collectionNames(db: Db, prefix = ""): Promise<string[]> {
  const collections = await db.listCollections({ type: "collection" }, { nameOnly: true, authorizedCollections: true }).toArray();
  return collections
    .map((c) => c.name)
    .filter((name) => !name.startsWith("system.") && name.startsWith(prefix))
    .sort();
}

/**
 * SHA-256 over every document, sorted by _id, in canonical Extended JSON (types and field
 * order preserved). A restored copy has the same fingerprint as its source; any insert,
 * delete or update changes it.
 */
export async function contentFingerprint(collection: mongo.Collection): Promise<string> {
  const hash = createHash("sha256");
  for await (const doc of collection.find({}).sort({ _id: 1 })) {
    hash.update(mongoose.mongo.BSON.EJSON.stringify(doc, { relaxed: false }));
    hash.update("\n");
  }
  return hash.digest("hex");
}

export async function collectionStats(db: Db, prefix = ""): Promise<CollectionStats[]> {
  const stats: CollectionStats[] = [];
  for (const name of await collectionNames(db, prefix)) {
    const collection = db.collection(name);
    stats.push({
      name,
      count: await collection.countDocuments({}),
      indexes: (await collection.indexes()).map((index) => normalizeIndex(index as Record<string, unknown>)),
      contentSha256: await contentFingerprint(collection),
    });
  }
  return stats;
}
