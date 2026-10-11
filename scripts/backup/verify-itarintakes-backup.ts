// Verify a downloaded backup (restore drills and recovery). Read-only.
//
//   node --import tsx scripts/backup/verify-itarintakes-backup.ts --manifest=<file.manifest.json> \
//     [--archive=<file.archive.gz> --checksum=<file.archive.gz.sha256>] [--restored-db=<recovery db>]
//
// With --archive/--checksum: checks the archive against its .sha256 and the manifest.
// With --restored-db (and RESTORE_CHECK_URI set): compares that database's collections,
// document counts, indexes and content fingerprints with the manifest. At least one of the
// two is required. It refuses to treat the live itarintakes database as a recovery database.

import { readFile, stat } from "node:fs/promises";
import mongoose from "mongoose";
import { parseChecksumFile, sha256File } from "./lib/checksum";
import { collectionStats } from "./lib/mongoStats";
import { normalizeMongoUri } from "./lib/mongoUri";
import { SOURCE_DB } from "./lib/naming";
import type { BackupManifest } from "./lib/runBackup";
import { compareSnapshot } from "./lib/verify";

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);

async function main() {
  const [archive, checksum, manifestPath, restoredDb] = [arg("archive"), arg("checksum"), arg("manifest"), arg("restored-db")];
  if (!manifestPath) throw new Error("--manifest is required");
  if (Boolean(archive) !== Boolean(checksum)) throw new Error("--archive and --checksum go together");
  if (!archive && !restoredDb) throw new Error("Give --archive/--checksum, --restored-db, or both");

  // A manifest file from S3, or `mongoexport --jsonArray` of the Atlas snapshot_<id>__manifest marker.
  const parsed = JSON.parse(await readFile(manifestPath, "utf8"));
  const manifest = (Array.isArray(parsed) ? parsed[0] : parsed) as BackupManifest;
  const problems: string[] = [];
  if (manifest.sourceDatabase !== SOURCE_DB) problems.push(`manifest source is ${manifest.sourceDatabase}, expected ${SOURCE_DB}`);

  if (archive && checksum) {
    const digest = await sha256File(archive);
    if (digest !== parseChecksumFile(await readFile(checksum, "utf8"))) problems.push("archive does not match its .sha256 file");
    if (digest !== manifest.archive.sha256) problems.push("archive does not match the manifest checksum");
    if ((await stat(archive)).size !== manifest.archive.sizeBytes) problems.push("archive size does not match the manifest");
    console.log(`Archive ${manifest.backupId}: ${problems.length ? "PROBLEMS" : "checksum and size OK"}`);
  }

  if (restoredDb) {
    if (restoredDb === SOURCE_DB) throw new Error("Refusing to treat the live itarintakes database as a recovery database");
    if (!process.env.RESTORE_CHECK_URI) throw new Error("RESTORE_CHECK_URI is required with --restored-db");
    const client = new mongoose.mongo.MongoClient(normalizeMongoUri(process.env.RESTORE_CHECK_URI));
    await client.connect();
    try {
      problems.push(...compareSnapshot(manifest.collections, await collectionStats(client.db(restoredDb)), (n) => n));
    } finally {
      await client.close();
    }
    console.log(
      `Restored database ${restoredDb}: compared ${manifest.collections.length} collections (counts, indexes, content fingerprints) with the manifest`
    );
  }

  if (problems.length) {
    console.error(`NOT VERIFIED:\n  ${problems.join("\n  ")}`);
    process.exit(1);
  }
  console.log("VERIFIED");
}

main().catch((error) => {
  console.error(`Verification failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
