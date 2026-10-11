// Retention policy for Atlas snapshots in the backup database.
//
// A snapshot is deleted only when it is MORE than 35 days old (a snapshot exactly 35 days
// old is kept). With weekly backups that keeps the last ~5–6 snapshots. Cleanup only ever
// considers collections whose names match the backup convention, never touches the
// snapshot just created, and does nothing unless that new snapshot is complete
// (verified and uploaded — its manifest marker exists).

import { parseSnapshotCollection } from "./naming";

export const RETENTION_DAYS = 35;
const DAY_MS = 24 * 60 * 60 * 1000;

/** True only when the snapshot is strictly older than the retention period. */
export function isExpired(snapshotTime: Date, now: Date, retentionDays = RETENTION_DAYS): boolean {
  return now.getTime() - snapshotTime.getTime() > retentionDays * DAY_MS;
}

export interface CleanupPlan {
  /** Exact collection names to drop. */
  drop: string[];
  /** Snapshot ids whose collections would be dropped. */
  expiredSnapshots: string[];
  keptSnapshots: string[];
  /** Collections in the backup database that are not backup snapshots (never touched). */
  ignored: string[];
  /** Set when cleanup must not run at all. */
  refused?: string;
}

export function planCleanup(
  collectionNames: string[],
  now: Date,
  currentBackupId: string,
  retentionDays = RETENTION_DAYS
): CleanupPlan {
  const plan: CleanupPlan = { drop: [], expiredSnapshots: [], keptSnapshots: [], ignored: [] };
  const bySnapshot = new Map<string, { time: Date; collections: string[]; complete: boolean }>();

  for (const name of collectionNames) {
    const parsed = parseSnapshotCollection(name);
    if (!parsed) {
      plan.ignored.push(name);
      continue;
    }
    const entry = bySnapshot.get(parsed.id) ?? { time: parsed.time, collections: [], complete: false };
    entry.collections.push(name);
    entry.complete ||= parsed.isManifest;
    bySnapshot.set(parsed.id, entry);
  }

  const current = bySnapshot.get(currentBackupId);
  if (!current?.complete) {
    return {
      ...plan,
      refused: `The new backup ${currentBackupId} is not complete (no manifest marker) — nothing is deleted.`,
    };
  }

  for (const [id, entry] of [...bySnapshot.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    if (id !== currentBackupId && isExpired(entry.time, now, retentionDays)) {
      plan.expiredSnapshots.push(id);
      plan.drop.push(...entry.collections.sort());
    } else {
      plan.keptSnapshots.push(id);
    }
  }
  return plan;
}
