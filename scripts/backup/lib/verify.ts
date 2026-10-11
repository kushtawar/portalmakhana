// Snapshot verification: every source collection must exist in the snapshot with the same
// document count, the same index definitions and the same content fingerprint (SHA-256 over
// every document, in _id order). Problem messages name collections but never include
// counts or document values, because workflow logs are public.

export interface IndexInfo {
  name: string;
  key: Record<string, unknown>;
  unique?: boolean;
  sparse?: boolean;
  expireAfterSeconds?: number;
  partialFilterExpression?: Record<string, unknown>;
  collation?: Record<string, unknown>;
}

export interface CollectionStats {
  name: string;
  count: number;
  indexes: IndexInfo[];
  /** SHA-256 over all documents (canonical Extended JSON, sorted by _id). */
  contentSha256?: string;
}

/** Keep only the properties that define an index, in a stable form. */
export function normalizeIndex(raw: Record<string, unknown>): IndexInfo {
  const index: IndexInfo = { name: String(raw.name), key: raw.key as Record<string, unknown> };
  if (raw.unique) index.unique = true;
  if (raw.sparse) index.sparse = true;
  if (typeof raw.expireAfterSeconds === "number") index.expireAfterSeconds = raw.expireAfterSeconds;
  if (raw.partialFilterExpression) index.partialFilterExpression = raw.partialFilterExpression as Record<string, unknown>;
  if (raw.collation) index.collation = raw.collation as Record<string, unknown>;
  return index;
}

const indexSignature = (indexes: IndexInfo[]) =>
  JSON.stringify(
    [...indexes]
      .map((i) => ({ ...i, key: Object.entries(i.key) }))
      .sort((a, b) => a.name.localeCompare(b.name))
  );

/**
 * Compare source stats with the restored snapshot. `snapshotName` maps a source
 * collection name to its snapshot collection name. Returns a list of problems (empty = ok).
 */
export function compareSnapshot(
  source: CollectionStats[],
  snapshot: CollectionStats[],
  snapshotName: (sourceCollection: string) => string
): string[] {
  const problems: string[] = [];
  if (source.length === 0) problems.push("The source database has no collections — refusing to treat this as a valid backup.");
  const restored = new Map(snapshot.map((c) => [c.name, c]));
  const expected = new Set(source.map((c) => snapshotName(c.name)));

  for (const collection of source) {
    const copy = restored.get(snapshotName(collection.name));
    if (!copy) {
      problems.push(`${collection.name}: missing from the snapshot`);
      continue;
    }
    if (copy.count !== collection.count) {
      problems.push(`${collection.name}: document count differs from the source`);
    } else if (collection.contentSha256 && copy.contentSha256 !== collection.contentSha256) {
      problems.push(`${collection.name}: document contents differ from the source`);
    }
    if (indexSignature(copy.indexes) !== indexSignature(collection.indexes)) {
      problems.push(`${collection.name}: index definitions differ from the source`);
    }
  }
  for (const name of restored.keys()) {
    if (!expected.has(name)) problems.push(`${name}: unexpected collection in the snapshot`);
  }
  return problems;
}

/**
 * True if two reads of the source differ — a collection added or removed, or any document
 * inserted, deleted or updated (content fingerprints differ), or an index changed.
 */
export function sourceChanged(before: CollectionStats[], after: CollectionStats[]): boolean {
  const summary = (stats: CollectionStats[]) =>
    JSON.stringify(
      [...stats]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((c) => [c.name, c.count, c.contentSha256 ?? null, indexSignature(c.indexes)])
    );
  return summary(before) !== summary(after);
}
