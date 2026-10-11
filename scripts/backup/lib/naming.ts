// Backup identifiers, Atlas snapshot collection names and S3 keys.
// Every name is derived from one UTC timestamp, so two runs can never share a name.

export const SOURCE_DB = "itarintakes";
export const BACKUP_DB = "itarintakes_backups";

/** Written last, after verification and upload: marks a snapshot as complete. */
export const MANIFEST_SUFFIX = "_manifest";

const ID_PATTERN = /^\d{8}T\d{6}Z$/;
const SNAPSHOT_COLLECTION = /^snapshot_(\d{8}T\d{6}Z)_(.+)$/;

/** UTC backup id, e.g. 20261011T030000Z. */
export function backupIdFor(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

/** Parse a backup id back to its time, or null if it isn't a valid id. */
export function parseBackupId(id: string): Date | null {
  if (!ID_PATTERN.test(id)) return null;
  const iso = `${id.slice(0, 4)}-${id.slice(4, 6)}-${id.slice(6, 8)}T${id.slice(9, 11)}:${id.slice(11, 13)}:${id.slice(13, 15)}Z`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) || backupIdFor(date) !== id ? null : date;
}

export const snapshotPrefix = (id: string) => `snapshot_${id}_`;
export const snapshotCollection = (id: string, source: string) => `${snapshotPrefix(id)}${source}`;
export const manifestCollection = (id: string) => snapshotCollection(id, MANIFEST_SUFFIX);

export interface ParsedSnapshotCollection {
  id: string;
  time: Date;
  /** Source collection name, or MANIFEST_SUFFIX for the completion marker. */
  source: string;
  isManifest: boolean;
}

/** Parse a collection in the backup database; null for anything not created by a backup. */
export function parseSnapshotCollection(name: string): ParsedSnapshotCollection | null {
  const match = SNAPSHOT_COLLECTION.exec(name);
  if (!match) return null;
  const time = parseBackupId(match[1]);
  if (!time) return null;
  return { id: match[1], time, source: match[2], isManifest: match[2] === MANIFEST_SUFFIX };
}

export interface S3Keys {
  archive: string;
  checksum: string;
  manifest: string;
}

/** e.g. patnamakhana/itarintakes/2026/10/11/itarintakes_20261011T030000Z.archive.gz */
export function s3KeysFor(prefix: string, id: string): S3Keys {
  const time = parseBackupId(id);
  if (!time) throw new Error(`Invalid backup id: ${id}`);
  const cleanPrefix = prefix.replace(/^\/+|\/+$/g, "");
  if (!cleanPrefix) throw new Error("S3 backup prefix must not be empty");
  const [yyyy, mm, dd] = [id.slice(0, 4), id.slice(4, 6), id.slice(6, 8)];
  const base = `${cleanPrefix}/${SOURCE_DB}/${yyyy}/${mm}/${dd}/${SOURCE_DB}_${id}`;
  return {
    archive: `${base}.archive.gz`,
    checksum: `${base}.archive.gz.sha256`,
    manifest: `${base}.manifest.json`,
  };
}
