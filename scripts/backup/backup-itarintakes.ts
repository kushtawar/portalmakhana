// Weekly backup of the itarintakes database. Run by .github/workflows/weekly-itarintakes-backup.yml.
// See docs/BACKUP_AND_RESTORE.md. Requires mongodump/mongorestore and the AWS CLI on PATH,
// AWS credentials in the environment, and:
//   MONGODB_BACKUP_URI, S3_BACKUP_BUCKET, S3_BACKUP_PREFIX, AWS_REGION
//
// Writes only to itarintakes_backups (new snapshot_<id>_* collections) and to new S3 keys.
// The live itarintakes database is only read.

import { execFile } from "node:child_process";
import { appendFile, chmod, mkdtemp, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import mongoose from "mongoose";
import { sha256File } from "./lib/checksum";
import { loadBackupConfig } from "./lib/config";
import { collectionNames, collectionStats } from "./lib/mongoStats";
import { describeUri } from "./lib/mongoUri";
import { maskInActionsLogs, redactToolOutput } from "./lib/redact";
import { BACKUP_DB, SOURCE_DB, manifestCollection } from "./lib/naming";
import { BackupError, runBackup, type BackupDeps, type BackupManifest } from "./lib/runBackup";
import { dumpArgs, listingContainsKey, restoreArgs, s3HeadArgs, s3ListKeyArgs, s3PutArgs } from "./lib/tools";

const run = promisify(execFile);

async function exec(command: string, args: string[]): Promise<string> {
  try {
    const { stdout } = await run(command, args, { maxBuffer: 64 * 1024 * 1024 });
    return stdout;
  } catch (error) {
    const e = error as { stderr?: string; message?: string; code?: unknown };
    // Never echo the arguments: they contain the connection string.
    throw new Error(`${command} failed (exit ${String(e.code)}): ${redactToolOutput(String(e.stderr || e.message || ""))}`);
  }
}

async function main() {
  const config = loadBackupConfig(process.env);
  maskInActionsLogs(config.backupUri);
  console.log(`Configuration OK · MongoDB ${describeUri(config.backupUri)} · region ${config.awsRegion}`);

  const workDir = await mkdtemp(join(process.env.RUNNER_TEMP || tmpdir(), "itarintakes-backup-"));
  await chmod(workDir, 0o700);
  const client = new mongoose.mongo.MongoClient(config.backupUri, { appName: "itarintakes-weekly-backup" });
  await client.connect();
  const source = client.db(SOURCE_DB); // read-only use
  const backups = client.db(BACKUP_DB);

  const deps: BackupDeps = {
    now: () => new Date(),
    log: (message) => console.log(message),
    workPath: (fileName) => join(workDir, fileName),
    sourceStats: () => collectionStats(source),
    backupStats: (prefix) => collectionStats(backups, prefix),
    listBackupCollections: () => collectionNames(backups),
    dump: async (archivePath) => void (await exec("mongodump", dumpArgs(config.backupUri, archivePath))),
    restore: async (archivePath, id) => void (await exec("mongorestore", restoreArgs(config.backupUri, archivePath, id))),
    sha256: sha256File,
    fileSize: async (path) => (await stat(path)).size,
    writeFile: (path, content) => writeFile(path, content, { mode: 0o600 }),
    // Any listing error (e.g. access denied) fails the run: never guess "absent".
    s3Exists: async (key) => listingContainsKey(await exec("aws", s3ListKeyArgs(config.s3Bucket, key)), key),
    s3PutNew: async (key, path, contentType) => void (await exec("aws", s3PutArgs(config.s3Bucket, key, path, contentType))),
    s3Head: async (key) => {
      const head = JSON.parse(await exec("aws", s3HeadArgs(config.s3Bucket, key)));
      return { size: Number(head.ContentLength), sha256Base64: head.ChecksumSHA256 };
    },
    writeManifestMarker: async (id, manifest: BackupManifest) => {
      // createCollection fails if it already exists, so a marker is never overwritten.
      const marker = await backups.createCollection(manifestCollection(id));
      await marker.insertOne({ ...manifest, completedAt: new Date() });
    },
    toolVersions: async () => ({
      mongodump: (await exec("mongodump", ["--version"])).split("\n")[0].trim(),
      mongorestore: (await exec("mongorestore", ["--version"])).split("\n")[0].trim(),
    }),
  };

  try {
    let manifest: BackupManifest | null = null;
    for (let attempt = 1; attempt <= 2 && !manifest; attempt++) {
      try {
        manifest = await runBackup(deps, { s3Prefix: config.s3Prefix });
      } catch (error) {
        // A write to the live database during the dump makes the copy unverifiable; nothing
        // has been restored or uploaded at that point, so one clean retry is safe.
        const changed = error instanceof BackupError && error.step.startsWith("Confirm the source");
        if (!changed || attempt === 2) throw error;
        console.log("Source changed during the dump — retrying once in 60 seconds with a new backup id.");
        await new Promise((resolve) => setTimeout(resolve, 60_000));
      }
    }
    if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `backup_id=${manifest!.backupId}\n`);
    if (process.env.GITHUB_STEP_SUMMARY) {
      await appendFile(
        process.env.GITHUB_STEP_SUMMARY,
        `### itarintakes backup ${manifest!.backupId}\n\n- ${manifest!.totals.collections} collections, ${manifest!.totals.documents} documents\n- Atlas: \`${BACKUP_DB}.${manifest!.snapshotCollectionPrefix}*\`\n- S3: \`${manifest!.archive.key}\` (${manifest!.archive.sizeBytes} bytes)\n- SHA-256: \`${manifest!.archive.sha256}\`\n`
      );
    }
  } finally {
    await client.close();
    await rm(workDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`::error title=itarintakes backup failed::${redactToolOutput(message, 2000).replace(/\n/g, "%0A")}`);
  process.exit(1);
});
