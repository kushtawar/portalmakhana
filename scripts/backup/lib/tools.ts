// Command-line arguments for mongodump, mongorestore and the AWS CLI. Pure functions, so
// the safety-critical flags (source database, namespace remapping, no --drop, no
// overwrite) are unit-tested.

import { BACKUP_DB, SOURCE_DB, snapshotPrefix } from "./naming";

/** mongodump of the source database only. `uri` must not name a database (normalizeMongoUri). */
export function dumpArgs(uri: string, archivePath: string): string[] {
  return [`--uri=${uri}`, `--db=${SOURCE_DB}`, "--gzip", `--archive=${archivePath}`, "--quiet"];
}

/**
 * mongorestore of a source archive into new snapshot collections in the backup database:
 * itarintakes.<coll> → itarintakes_backups.snapshot_<id>_<coll>. Never --drop: an existing
 * collection would make the restore fail rather than be replaced.
 */
export function restoreArgs(uri: string, archivePath: string, backupId: string): string[] {
  return [
    `--uri=${uri}`,
    "--gzip",
    `--archive=${archivePath}`,
    `--nsInclude=${SOURCE_DB}.*`,
    `--nsFrom=${SOURCE_DB}.$coll$`,
    `--nsTo=${BACKUP_DB}.${snapshotPrefix(backupId)}$coll$`,
    "--stopOnError",
    "--quiet",
  ];
}

/** Upload that fails (HTTP 412) if the key already exists; S3 stores a SHA-256 checksum. */
export function s3PutArgs(bucket: string, key: string, path: string, contentType: string): string[] {
  return [
    "s3api",
    "put-object",
    "--bucket",
    bucket,
    "--key",
    key,
    "--body",
    path,
    "--content-type",
    contentType,
    "--if-none-match",
    "*",
    "--checksum-algorithm",
    "SHA256",
    "--output",
    "json",
  ];
}

/**
 * Pre-run "does this key already exist?" check: list objects whose key starts with the exact
 * key. The role's s3:ListBucket is only allowed for prefixes under <prefix>/itarintakes/.
 */
export function s3ListKeyArgs(bucket: string, key: string): string[] {
  return ["s3api", "list-objects-v2", "--bucket", bucket, "--prefix", key, "--output", "json"];
}

/**
 * Whether a list-objects-v2 result contains exactly `key`. Keys that merely start with it
 * (e.g. "<archive>.sha256" when checking "<archive>") don't count. An empty result means no
 * objects; anything unparseable throws rather than being treated as "absent".
 */
export function listingContainsKey(stdout: string, key: string): boolean {
  if (!stdout.trim()) return false;
  let parsed: unknown;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    throw new Error("Unexpected list-objects-v2 output (not JSON)");
  }
  const contents = (parsed as { Contents?: unknown } | null)?.Contents;
  if (contents === undefined || contents === null) return false;
  if (!Array.isArray(contents)) throw new Error("Unexpected list-objects-v2 output (Contents is not a list)");
  return contents.some((object) => (object as { Key?: unknown })?.Key === key);
}

export function s3HeadArgs(bucket: string, key: string): string[] {
  return ["s3api", "head-object", "--bucket", bucket, "--key", key, "--checksum-mode", "ENABLED", "--output", "json"];
}
