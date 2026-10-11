// The weekly backup, step by step. All I/O is injected (see BackupDeps) so the flow —
// including its failure paths — is unit-tested without MongoDB or AWS.
//
// Order: refuse to overwrite anything → read source stats → dump itarintakes only →
// checksum → confirm the source didn't change during the dump → restore into a new,
// uniquely named snapshot in itarintakes_backups → verify counts and indexes → upload
// archive, checksum and manifest to S3 (no overwrite) → verify the uploads → write the
// snapshot's manifest marker (= complete). Any failure stops the run before the marker is
// written, so retention cleanup (which requires the marker) never runs after it.

import { checksumFileContent, hexToBase64 } from "./checksum";
import {
  BACKUP_DB,
  MANIFEST_SUFFIX,
  SOURCE_DB,
  backupIdFor,
  s3KeysFor,
  snapshotCollection,
  snapshotPrefix,
  type S3Keys,
} from "./naming";
import { RETENTION_DAYS } from "./retention";
import { compareSnapshot, sourceChanged, type CollectionStats } from "./verify";

export interface S3Object {
  size: number;
  /** Base64 SHA-256 reported by S3, when the object was uploaded with a SHA-256 checksum. */
  sha256Base64?: string;
}

export interface BackupDeps {
  now(): Date;
  log(message: string): void;
  /** Path for a file in the run's private working directory. */
  workPath(fileName: string): string;
  /** Collections, counts and indexes of the live source database (read-only). */
  sourceStats(): Promise<CollectionStats[]>;
  /** Collections, counts and indexes in the backup database whose names start with `prefix`. */
  backupStats(prefix: string): Promise<CollectionStats[]>;
  listBackupCollections(): Promise<string[]>;
  /** mongodump of the source database only, gzip-compressed archive. */
  dump(archivePath: string): Promise<void>;
  /** mongorestore of the archive into the backup database under snapshot_<id>_* names. */
  restore(archivePath: string, backupId: string): Promise<void>;
  sha256(path: string): Promise<string>;
  fileSize(path: string): Promise<number>;
  writeFile(path: string, content: string): Promise<void>;
  s3Exists(key: string): Promise<boolean>;
  /** Upload that must fail if the key already exists, with a SHA-256 checksum. */
  s3PutNew(key: string, path: string, contentType: string): Promise<void>;
  s3Head(key: string): Promise<S3Object>;
  /** Create snapshot_<id>__manifest with the manifest document (marks the snapshot complete). */
  writeManifestMarker(backupId: string, manifest: BackupManifest): Promise<void>;
  toolVersions(): Promise<Record<string, string>>;
}

export interface BackupManifest {
  backupId: string;
  createdAt: string;
  sourceDatabase: string;
  backupDatabase: string;
  snapshotCollectionPrefix: string;
  retentionDays: number;
  archive: { key: string; fileName: string; sizeBytes: number; sha256: string };
  checksumKey: string;
  manifestKey: string;
  collections: CollectionStats[];
  totals: { collections: number; documents: number };
  tools: Record<string, string>;
}

export class BackupError extends Error {
  constructor(
    readonly step: string,
    message: string
  ) {
    super(`[${step}] ${message}`);
  }
}

async function step<T>(name: string, deps: BackupDeps, fn: () => Promise<T>): Promise<T> {
  deps.log(`▶ ${name}`);
  try {
    return await fn();
  } catch (error) {
    if (error instanceof BackupError) throw error;
    throw new BackupError(name, error instanceof Error ? error.message : String(error));
  }
}

export async function runBackup(deps: BackupDeps, options: { s3Prefix: string }): Promise<BackupManifest> {
  const startedAt = deps.now();
  const id = backupIdFor(startedAt);
  const keys: S3Keys = s3KeysFor(options.s3Prefix, id);
  const archivePath = deps.workPath(`${SOURCE_DB}_${id}.archive.gz`);
  const checksumPath = `${archivePath}.sha256`;
  const manifestPath = deps.workPath(`${SOURCE_DB}_${id}.manifest.json`);
  deps.log(`Backup ${id}: ${SOURCE_DB} → ${BACKUP_DB}.${snapshotPrefix(id)}* and s3://…/${keys.archive}`);

  await step("Refuse to overwrite an existing backup", deps, async () => {
    const existing = (await deps.listBackupCollections()).filter((name) => name.startsWith(snapshotPrefix(id)));
    if (existing.length) throw new Error(`snapshot ${id} already exists in ${BACKUP_DB}`);
    for (const key of Object.values(keys)) {
      if (await deps.s3Exists(key)) throw new Error(`S3 object already exists: ${key}`);
    }
  });

  const before = await step("Read source collections, counts and indexes", deps, async () => {
    const stats = await deps.sourceStats();
    if (stats.length === 0) throw new Error(`${SOURCE_DB} has no collections`);
    if (stats.some((c) => c.name === MANIFEST_SUFFIX)) {
      throw new Error(`source collection "${MANIFEST_SUFFIX}" would clash with the snapshot marker`);
    }
    deps.log(`  ${stats.length} collections, ${stats.reduce((n, c) => n + c.count, 0)} documents`);
    return stats;
  });

  const sha256 = await step(`Dump ${SOURCE_DB} and compute SHA-256`, deps, async () => {
    await deps.dump(archivePath);
    const digest = await deps.sha256(archivePath);
    await deps.writeFile(checksumPath, checksumFileContent(digest, archivePath));
    deps.log(`  archive ${await deps.fileSize(archivePath)} bytes, sha256 ${digest}`);
    return digest;
  });

  await step("Confirm the source did not change during the dump", deps, async () => {
    if (sourceChanged(before, await deps.sourceStats())) {
      throw new Error("the source changed while the dump ran, so it can't be verified — re-run the backup");
    }
  });

  await step(`Restore into ${BACKUP_DB}.${snapshotPrefix(id)}*`, deps, () => deps.restore(archivePath, id));

  await step("Verify snapshot counts and indexes against the source", deps, async () => {
    const problems = compareSnapshot(before, await deps.backupStats(snapshotPrefix(id)), (name) =>
      snapshotCollection(id, name)
    );
    if (problems.length) throw new Error(`snapshot does not match the source:\n  ${problems.join("\n  ")}`);
  });

  const manifest: BackupManifest = await step("Write manifest", deps, async () => {
    const value: BackupManifest = {
      backupId: id,
      createdAt: startedAt.toISOString(),
      sourceDatabase: SOURCE_DB,
      backupDatabase: BACKUP_DB,
      snapshotCollectionPrefix: snapshotPrefix(id),
      retentionDays: RETENTION_DAYS,
      archive: {
        key: keys.archive,
        fileName: archivePath.split("/").pop()!,
        sizeBytes: await deps.fileSize(archivePath),
        sha256,
      },
      checksumKey: keys.checksum,
      manifestKey: keys.manifest,
      collections: before,
      totals: { collections: before.length, documents: before.reduce((n, c) => n + c.count, 0) },
      tools: await deps.toolVersions(),
    };
    await deps.writeFile(manifestPath, `${JSON.stringify(value, null, 2)}\n`);
    return value;
  });

  await step("Upload archive, checksum and manifest to S3 (never overwriting)", deps, async () => {
    await deps.s3PutNew(keys.archive, archivePath, "application/gzip");
    await deps.s3PutNew(keys.checksum, checksumPath, "text/plain");
    await deps.s3PutNew(keys.manifest, manifestPath, "application/json");
  });

  await step("Verify the uploaded objects", deps, async () => {
    const archive = await deps.s3Head(keys.archive);
    if (archive.size !== manifest.archive.sizeBytes) {
      throw new Error(`archive size in S3 is ${archive.size}, expected ${manifest.archive.sizeBytes}`);
    }
    if (archive.sha256Base64 !== hexToBase64(sha256)) throw new Error("archive SHA-256 in S3 does not match");
    for (const [key, path] of [
      [keys.checksum, checksumPath],
      [keys.manifest, manifestPath],
    ]) {
      const object = await deps.s3Head(key);
      if (object.size !== (await deps.fileSize(path))) throw new Error(`size mismatch for ${key}`);
      if (object.sha256Base64 !== hexToBase64(await deps.sha256(path))) throw new Error(`SHA-256 mismatch for ${key}`);
    }
  });

  await step("Mark the snapshot complete", deps, () => deps.writeManifestMarker(id, manifest));
  deps.log(`✔ Backup ${id} complete: ${manifest.totals.collections} collections, ${manifest.totals.documents} documents`);
  return manifest;
}
