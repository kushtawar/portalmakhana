// Retention cleanup for Atlas snapshots in itarintakes_backups (rules: lib/retention.ts).
//
// Preview (default, read-only):
//   node --import tsx scripts/backup/cleanup-itarintakes-backups.ts --backup-id=<id of the run just completed>
// Apply (drops only expired snapshot collections, one by one, by exact name):
//   ... --backup-id=<id> --apply
//
// Requires MONGODB_RETENTION_URI. It never drops the database, never touches collections
// outside the snapshot_<id>_* convention, never touches the new snapshot, and refuses to
// do anything unless the new snapshot's manifest marker exists (backup verified and uploaded).

import { appendFile } from "node:fs/promises";
import mongoose from "mongoose";
import { loadRetentionConfig } from "./lib/config";
import { collectionNames } from "./lib/mongoStats";
import { describeUri } from "./lib/mongoUri";
import { maskInActionsLogs, redactToolOutput } from "./lib/redact";
import { BACKUP_DB, parseBackupId } from "./lib/naming";
import { RETENTION_DAYS, planCleanup } from "./lib/retention";

async function main() {
  const apply = process.argv.includes("--apply");
  const backupId = process.argv.find((arg) => arg.startsWith("--backup-id="))?.slice("--backup-id=".length) ?? "";
  if (!parseBackupId(backupId)) throw new Error("--backup-id=<YYYYMMDDTHHMMSSZ> of the completed backup is required");
  const config = loadRetentionConfig(process.env);
  maskInActionsLogs(config.retentionUri);
  console.log(`Retention cleanup (${apply ? "APPLY" : "preview"}) · ${describeUri(config.retentionUri)} · keep ${RETENTION_DAYS} days`);

  const client = new mongoose.mongo.MongoClient(config.retentionUri, { appName: "itarintakes-backup-retention" });
  await client.connect();
  try {
    const db = client.db(BACKUP_DB);
    const plan = planCleanup(await collectionNames(db), new Date(), backupId);
    if (plan.refused) throw new Error(plan.refused);

    console.log(`Kept snapshots (${plan.keptSnapshots.length}): ${plan.keptSnapshots.join(", ") || "none"}`);
    console.log(`Expired snapshots (${plan.expiredSnapshots.length}): ${plan.expiredSnapshots.join(", ") || "none"}`);
    if (plan.ignored.length) console.log(`Not backup snapshots, left alone: ${plan.ignored.length} collection(s)`);

    if (!apply) {
      console.log(`Preview only — ${plan.drop.length} collection(s) would be dropped. Re-run with --apply.`);
    } else {
      for (const name of plan.drop) {
        await db.collection(name).drop();
        console.log(`  dropped ${name}`);
      }
      console.log(`Dropped ${plan.drop.length} collection(s) from ${plan.expiredSnapshots.length} expired snapshot(s).`);
    }
    if (process.env.GITHUB_STEP_SUMMARY) {
      await appendFile(
        process.env.GITHUB_STEP_SUMMARY,
        `\n### Retention\n\n- Kept: ${plan.keptSnapshots.length} snapshot(s)\n- ${apply ? "Removed" : "Would remove"}: ${plan.expiredSnapshots.join(", ") || "none"}\n`
      );
    }
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(`::error title=itarintakes backup retention failed::${redactToolOutput(error instanceof Error ? error.message : String(error), 1000)}`);
  process.exit(1);
});
