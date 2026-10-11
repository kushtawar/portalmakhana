// Weekly itarintakes backup: naming, retention, verification, checksums, tool arguments and
// the full backup flow with fake MongoDB/S3 dependencies. No network or database is used.

import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { checksumFileContent, hexToBase64, parseChecksumFile, sha256File, verifyChecksum } from "../scripts/backup/lib/checksum";
import { loadBackupConfig, loadRetentionConfig } from "../scripts/backup/lib/config";
import { describeUri, normalizeMongoUri } from "../scripts/backup/lib/mongoUri";
import {
  BACKUP_DB,
  SOURCE_DB,
  backupIdFor,
  manifestCollection,
  parseBackupId,
  parseSnapshotCollection,
  s3KeysFor,
  snapshotCollection,
} from "../scripts/backup/lib/naming";
import { isExpired, planCleanup } from "../scripts/backup/lib/retention";
import { runBackup, type BackupDeps, type BackupManifest } from "../scripts/backup/lib/runBackup";
import { dumpArgs, listingContainsKey, restoreArgs, s3ListKeyArgs, s3PutArgs } from "../scripts/backup/lib/tools";
import { contentFingerprint } from "../scripts/backup/lib/mongoStats";
import { redactToolOutput, secretPartsOfUri } from "../scripts/backup/lib/redact";
import { compareSnapshot, normalizeIndex, sourceChanged, type CollectionStats } from "../scripts/backup/lib/verify";

const DAY = 24 * 60 * 60 * 1000;
const at = (iso: string) => new Date(iso);

describe("backup names", () => {
  it("uses a UTC timestamp id that round-trips", () => {
    const id = backupIdFor(at("2026-10-11T03:00:07.123Z"));
    assert.equal(id, "20261011T030007Z");
    assert.equal(parseBackupId(id)!.toISOString(), "2026-10-11T03:00:07.000Z");
    assert.equal(parseBackupId("20261341T030007Z"), null, "invalid month");
    assert.equal(parseBackupId("2026-10-11"), null);
  });

  it("gives every run its own snapshot names and S3 keys", () => {
    const a = backupIdFor(at("2026-10-11T03:00:00Z"));
    const b = backupIdFor(at("2026-10-18T03:00:00Z"));
    assert.notEqual(snapshotCollection(a, "products"), snapshotCollection(b, "products"));
    assert.deepEqual(s3KeysFor("patnamakhana", a), {
      archive: "patnamakhana/itarintakes/2026/10/11/itarintakes_20261011T030000Z.archive.gz",
      checksum: "patnamakhana/itarintakes/2026/10/11/itarintakes_20261011T030000Z.archive.gz.sha256",
      manifest: "patnamakhana/itarintakes/2026/10/11/itarintakes_20261011T030000Z.manifest.json",
    });
    assert.notEqual(s3KeysFor("patnamakhana", a).archive, s3KeysFor("patnamakhana", b).archive);
  });

  it("recognises only backup snapshot collections", () => {
    assert.deepEqual(parseSnapshotCollection("snapshot_20261011T030000Z_products")?.source, "products");
    assert.equal(parseSnapshotCollection(manifestCollection("20261011T030000Z"))?.isManifest, true);
    for (const name of ["products", "snapshot_products", "snapshot_2026_products", "snapshot_20261399T030000Z_products", "Snapshot_20261011T030000Z_x"]) {
      assert.equal(parseSnapshotCollection(name), null, name);
    }
  });
});

describe("retention", () => {
  const now = at("2026-11-15T03:00:00Z");

  it("keeps a snapshot exactly 35 days old and expires one just older", () => {
    assert.equal(isExpired(new Date(now.getTime() - 35 * DAY), now), false);
    assert.equal(isExpired(new Date(now.getTime() - 35 * DAY - 1000), now), true);
    assert.equal(isExpired(new Date(now.getTime() - 34 * DAY), now), false);
  });

  const weekly = (weeksAgo: number) => backupIdFor(new Date(now.getTime() - weeksAgo * 7 * DAY));
  const snapshotCollections = (id: string, complete = true) => [
    snapshotCollection(id, "products"),
    snapshotCollection(id, "articles"),
    ...(complete ? [manifestCollection(id)] : []),
  ];

  it("keeps about five weeks of snapshots and drops only expired snapshot collections", () => {
    const current = weekly(0);
    const names = [0, 1, 2, 3, 4, 5, 6, 7].flatMap((w) => snapshotCollections(weekly(w)));
    names.push("notes", "snapshot_products", "manual_copy_products");
    const plan = planCleanup(names, now, current);

    assert.equal(plan.refused, undefined);
    assert.deepEqual(plan.keptSnapshots, [5, 4, 3, 2, 1, 0].map(weekly)); // 0–35 days old
    assert.deepEqual(plan.expiredSnapshots, [7, 6].map(weekly)); // 42 and 49 days old
    assert.deepEqual(plan.drop.sort(), [6, 7].flatMap((w) => snapshotCollections(weekly(w))).sort());
    assert.deepEqual(plan.ignored.sort(), ["manual_copy_products", "notes", "snapshot_products"]);
    for (const name of plan.drop) assert.ok(parseSnapshotCollection(name), `${name} is a backup snapshot`);
  });

  it("does nothing when the new backup is not complete (failed verification or upload)", () => {
    const current = weekly(0);
    const names = [...snapshotCollections(current, false), ...snapshotCollections(weekly(8))];
    const plan = planCleanup(names, now, current);
    assert.ok(plan.refused);
    assert.deepEqual(plan.drop, []);
  });

  it("never deletes the new snapshot, even with a skewed clock", () => {
    const current = backupIdFor(at("2026-01-01T03:00:00Z"));
    const plan = planCleanup(snapshotCollections(current), now, current);
    assert.deepEqual(plan.drop, []);
  });
});

describe("verification", () => {
  const index = (name: string, key: Record<string, number>, extra: Record<string, unknown> = {}) =>
    normalizeIndex({ name, key, v: 2, ...extra });
  const source: CollectionStats[] = [
    { name: "products", count: 18, indexes: [index("_id_", { _id: 1 }), index("slug_1", { slug: 1 }, { unique: true })] },
    { name: "enquiries", count: 2, indexes: [index("_id_", { _id: 1 })] },
  ];
  const id = "20261011T030000Z";
  const asSnapshot = (stats: CollectionStats[]) => stats.map((c) => ({ ...c, name: snapshotCollection(id, c.name) }));
  const map = (name: string) => snapshotCollection(id, name);

  it("accepts a matching snapshot", () => {
    assert.deepEqual(compareSnapshot(source, asSnapshot(source), map), []);
  });

  it("reports count, index, missing and extra collection differences", () => {
    const snapshot = asSnapshot(source);
    snapshot[0] = { ...snapshot[0], count: 17, indexes: [index("_id_", { _id: 1 }), index("slug_1", { slug: 1 })] };
    snapshot.pop();
    snapshot.push({ name: map("stray"), count: 0, indexes: [] });
    const problems = compareSnapshot(source, snapshot, map);
    assert.equal(problems.length, 4);
    assert.match(problems.join("\n"), /products: document count differs/);
    assert.match(problems.join("\n"), /index definitions differ/);
    assert.ok(!/\b1[78]\b/.test(problems.join("\n")), "no counts in (public) problem messages");
    assert.match(problems.join("\n"), /enquiries: missing/);
    assert.match(problems.join("\n"), /unexpected collection/);
  });

  it("detects changed contents even when the document count is the same", () => {
    const withDigest = source.map((c) => ({ ...c, contentSha256: `${c.name}-v1` }));
    const snapshot = asSnapshot(withDigest);
    snapshot[1] = { ...snapshot[1], contentSha256: "enquiries-v2" };
    assert.deepEqual(compareSnapshot(withDigest, snapshot, map), ["enquiries: document contents differ from the source"]);
  });

  it("refuses an empty source", () => {
    assert.match(compareSnapshot([], [], map).join(), /no collections/);
  });

  it("detects a source that changed during the dump — including updates", () => {
    const v1 = source.map((c) => ({ ...c, contentSha256: `${c.name}-v1` }));
    assert.equal(sourceChanged(v1, structuredClone(v1)), false);
    assert.equal(sourceChanged(v1, [{ ...v1[0], count: 19 }, v1[1]]), true, "insert");
    assert.equal(sourceChanged(v1, [v1[0], { ...v1[1], contentSha256: "enquiries-v2" }]), true, "update, same count");
  });

  it("fingerprints documents in _id order and changes on any update", async () => {
    const fakeCollection = (docs: Record<string, unknown>[]) =>
      ({
        find: () => ({
          sort: () => ({
            async *[Symbol.asyncIterator]() {
              yield* docs;
            },
          }),
        }),
      }) as unknown as Parameters<typeof contentFingerprint>[0];
    const docs = [
      { _id: 1, name: "Silver", price: 200 },
      { _id: 2, name: "Gold", price: 235 },
    ];
    const a = await contentFingerprint(fakeCollection(docs));
    assert.equal(a, await contentFingerprint(fakeCollection(structuredClone(docs))));
    assert.notEqual(a, await contentFingerprint(fakeCollection([docs[0], { ...docs[1], price: 236 }])));
    assert.notEqual(a, await contentFingerprint(fakeCollection([docs[0], { ...docs[1], price: "235" }])), "types matter");
    assert.match(a, /^[0-9a-f]{64}$/);
  });
});

describe("checksums", () => {
  it("computes and verifies SHA-256, and detects tampering", async () => {
    const dir = await mkdtemp(join(tmpdir(), "backup-test-"));
    const archive = join(dir, "itarintakes_20261011T030000Z.archive.gz");
    await writeFile(archive, "backup-bytes");
    const digest = await sha256File(archive);
    assert.equal(digest, "3f75e04c360b46d235f2fc1059fc5a3b29c02152b3e261f878d3875cf7f5277c"); // shasum -a 256 of "backup-bytes"
    await writeFile(`${archive}.sha256`, checksumFileContent(digest, archive));
    assert.equal(await readFile(`${archive}.sha256`, "utf8"), `${digest}  itarintakes_20261011T030000Z.archive.gz\n`);
    assert.equal(await verifyChecksum(archive, `${archive}.sha256`), true);
    await writeFile(archive, "tampered");
    assert.equal(await verifyChecksum(archive, `${archive}.sha256`), false);
    assert.throws(() => parseChecksumFile("not a digest"));
    assert.equal(hexToBase64("00ff"), "AP8=");
  });
});

describe("never-overwrite check (exact-key listing)", () => {
  const keys = s3KeysFor("patnamakhana", "20261011T030000Z");

  it("lists with the exact key as prefix, inside the role's allowed prefix", () => {
    const args = s3ListKeyArgs("patnamakhana-db-backups-x", keys.archive);
    assert.deepEqual(args.slice(0, 2), ["s3api", "list-objects-v2"]);
    assert.equal(args[args.indexOf("--prefix") + 1], keys.archive);
    assert.ok(keys.archive.startsWith("patnamakhana/itarintakes/"), "matches s3:prefix patnamakhana/itarintakes/*");
    for (const key of Object.values(keys)) assert.ok(key.startsWith("patnamakhana/itarintakes/"));
  });

  it("finds only an exact key match", () => {
    const listing = (...k: string[]) => JSON.stringify({ Contents: k.map((Key) => ({ Key, Size: 1 })) });
    assert.equal(listingContainsKey(listing(keys.archive), keys.archive), true);
    // The checksum key starts with the archive key — it must not count as the archive.
    assert.equal(listingContainsKey(listing(keys.checksum), keys.archive), false);
    assert.equal(listingContainsKey(listing(keys.archive, keys.checksum), keys.checksum), true);
  });

  it("treats an empty listing as absent", () => {
    assert.equal(listingContainsKey("", keys.archive), false);
    assert.equal(listingContainsKey("  \n", keys.archive), false);
    assert.equal(listingContainsKey(JSON.stringify({ KeyCount: 0, Prefix: keys.archive }), keys.archive), false);
  });

  it("throws on unexpected output instead of assuming the key is absent", () => {
    assert.throws(() => listingContainsKey("not json", keys.archive), /not JSON/);
    assert.throws(() => listingContainsKey(JSON.stringify({ Contents: "x" }), keys.archive), /not a list/);
  });

  it("a listing error stops the run before anything is written", async () => {
    const { deps, state } = fakeWorld({
      s3Exists: async () => {
        throw new Error("aws failed (exit 254): An error occurred (AccessDenied) when calling the ListObjectsV2 operation");
      },
    });
    await assert.rejects(runBackup(deps, { s3Prefix: "patnamakhana" }), /Refuse to overwrite[\s\S]*AccessDenied/);
    assert.equal(state.s3.size, 0);
    assert.equal(state.backupCollections.length, 0);
  });

  it("an existing S3 key (e.g. only the manifest) refuses the run", async () => {
    const { deps, state } = fakeWorld();
    state.s3.set(keys.manifest, { size: 1, sha256Base64: "x" });
    await assert.rejects(runBackup(deps, { s3Prefix: "patnamakhana" }), /S3 object already exists/);
    assert.equal(state.s3.size, 1);
  });
});

describe("public log safety", () => {
  it("removes connection strings, quoted values and document fragments from tool output", () => {
    const stderr = `Failed: mongodb+srv://backup:pässword@cluster0.example.mongodb.net/ E11000 duplicate key error collection: itarintakes_backups.snapshot_x_enquiries index: email_1 dup key: { email: "customer@example.com" } and 'secret-value'`;
    const safe = redactToolOutput(stderr);
    for (const leak of ["pässword", "customer@example.com", "secret-value", "cluster0.example"]) {
      assert.ok(!safe.includes(leak), `leaked ${leak}`);
    }
    assert.match(safe, /E11000 duplicate key error/);
    assert.ok(redactToolOutput("x".repeat(1000)).length <= 400);
  });

  it("masks the whole connection string, the user and the password (encoded and decoded)", () => {
    const parts = secretPartsOfUri("mongodb+srv://backup:p%C3%A4ss@cluster0.example.mongodb.net/?retryWrites=true");
    for (const expected of ["backup", "p%C3%A4ss", "päss"]) assert.ok(parts.includes(expected), expected);
    assert.ok(!parts.includes("mongodb+srv") && !parts.includes("retryWrites=true"), "harmless words are not masked");
  });
});

describe("source database selection and connection strings", () => {
  const atlas = "mongodb+srv://backup:p%C3%BCss@cluster0.example.mongodb.net/itarintakes?retryWrites=true";

  it("percent-encodes credentials (including non-ASCII) and drops the database path", () => {
    assert.equal(
      normalizeMongoUri("mongodb+srv://backup:dbüser@cluster0.example.mongodb.net/itarintakes?retryWrites=true"),
      "mongodb+srv://backup:db%C3%BCser@cluster0.example.mongodb.net/?retryWrites=true"
    );
    assert.equal(normalizeMongoUri(atlas), "mongodb+srv://backup:p%C3%BCss@cluster0.example.mongodb.net/?retryWrites=true");
    assert.ok(!/[^\x00-\x7f]/.test(normalizeMongoUri("mongodb://u:ü@h:27017")));
    assert.equal(describeUri(atlas), "mongodb+srv://<credentials hidden>@1 host(s)");
  });

  it("dumps only itarintakes and restores into new snapshot namespaces without --drop", () => {
    const uri = normalizeMongoUri(atlas);
    const dump = dumpArgs(uri, "/tmp/a.gz");
    assert.ok(dump.includes(`--db=${SOURCE_DB}`));
    const restore = restoreArgs(uri, "/tmp/a.gz", "20261011T030000Z");
    assert.ok(restore.includes(`--nsInclude=${SOURCE_DB}.*`));
    assert.ok(restore.includes(`--nsFrom=${SOURCE_DB}.$coll$`));
    assert.ok(restore.includes(`--nsTo=${BACKUP_DB}.snapshot_20261011T030000Z_$coll$`));
    for (const args of [dump, restore]) assert.ok(!args.some((a) => a.startsWith("--drop")));
    assert.ok(s3PutArgs("b", "k", "/f", "application/gzip").join(" ").includes("--if-none-match *"));
  });

  it("refuses URIs that name another database, the public media bucket, and missing settings", () => {
    const env = { MONGODB_BACKUP_URI: atlas, S3_BACKUP_BUCKET: "patnamakhana-db-backups", S3_BACKUP_PREFIX: "patnamakhana", AWS_REGION: "eu-central-1" };
    assert.equal(loadBackupConfig(env).s3Prefix, "patnamakhana");
    assert.throws(() => loadBackupConfig({ ...env, MONGODB_BACKUP_URI: atlas.replace("/itarintakes", "/quizapp") }), /quizapp/);
    assert.throws(() => loadBackupConfig({ ...env, S3_BACKUP_BUCKET: "itarintakes" }), /public media bucket/);
    assert.throws(() => loadBackupConfig({ ...env, AWS_REGION: "" }), /Missing required configuration: AWS_REGION/);
    assert.throws(
      () => loadRetentionConfig({ MONGODB_RETENTION_URI: atlas }),
      /expected none or "itarintakes_backups"/,
      "the retention credential must not target the live database"
    );
    try {
      loadBackupConfig({ ...env, MONGODB_BACKUP_URI: atlas.replace("/itarintakes", "/quizapp") });
    } catch (error) {
      assert.ok(!(error as Error).message.includes("p%C3%BCss"), "no credentials in errors");
    }
  });
});

// ---- Full flow with fakes ---------------------------------------------------------------

function fakeWorld(overrides: Partial<BackupDeps> = {}) {
  const sourceStats: CollectionStats[] = [
    { name: "products", count: 18, indexes: [normalizeIndex({ name: "_id_", key: { _id: 1 } })] },
    { name: "enquiries", count: 2, indexes: [normalizeIndex({ name: "_id_", key: { _id: 1 } })] },
  ];
  const state = {
    backupCollections: [] as CollectionStats[],
    s3: new Map<string, { size: number; sha256Base64: string }>(),
    files: new Map<string, string>(),
    markers: [] as string[],
    liveWrites: 0,
  };
  const digestOf = (content: string) => `${"a".repeat(62)}${String(content.length).padStart(2, "0")}`;
  const deps: BackupDeps = {
    now: () => at("2026-10-11T03:00:00Z"),
    log: () => {},
    workPath: (name) => `/work/${name}`,
    sourceStats: async () => structuredClone(sourceStats),
    backupStats: async (prefix) => state.backupCollections.filter((c) => c.name.startsWith(prefix)),
    listBackupCollections: async () => state.backupCollections.map((c) => c.name),
    dump: async (path) => void state.files.set(path, "ARCHIVE"),
    restore: async (_path, id) => {
      for (const c of sourceStats) {
        const name = snapshotCollection(id, c.name);
        if (state.backupCollections.some((x) => x.name === name)) throw new Error("collection exists");
        state.backupCollections.push({ ...structuredClone(c), name });
      }
    },
    sha256: async (path) => digestOf(state.files.get(path) ?? ""),
    fileSize: async (path) => (state.files.get(path) ?? "").length,
    writeFile: async (path, content) => void state.files.set(path, content),
    s3Exists: async (key) => state.s3.has(key),
    s3PutNew: async (key, path) => {
      if (state.s3.has(key)) throw new Error("PreconditionFailed");
      const content = state.files.get(path) ?? "";
      state.s3.set(key, { size: content.length, sha256Base64: hexToBase64(digestOf(content)) });
    },
    s3Head: async (key) => {
      const object = state.s3.get(key);
      if (!object) throw new Error("404");
      return object;
    },
    writeManifestMarker: async (id) => {
      const name = manifestCollection(id);
      if (state.backupCollections.some((c) => c.name === name)) throw new Error("exists");
      state.backupCollections.push({ name, count: 1, indexes: [] });
      state.markers.push(id);
    },
    toolVersions: async () => ({ mongodump: "test", mongorestore: "test" }),
    ...overrides,
  };
  return { deps, state };
}

describe("backup flow", () => {
  it("dumps, restores, verifies, uploads three new objects and marks the snapshot complete", async () => {
    const { deps, state } = fakeWorld();
    const manifest: BackupManifest = await runBackup(deps, { s3Prefix: "patnamakhana" });
    assert.equal(manifest.backupId, "20261011T030000Z");
    assert.equal(manifest.sourceDatabase, SOURCE_DB);
    assert.deepEqual(manifest.totals, { collections: 2, documents: 20 });
    assert.equal(state.s3.size, 3);
    assert.deepEqual(state.markers, ["20261011T030000Z"]);
    assert.deepEqual(
      state.backupCollections.map((c) => c.name).sort(),
      [manifestCollection(manifest.backupId), snapshotCollection(manifest.backupId, "enquiries"), snapshotCollection(manifest.backupId, "products")].sort()
    );
    // …and that completed run is what retention cleanup requires.
    assert.equal(planCleanup(state.backupCollections.map((c) => c.name), deps.now(), manifest.backupId).refused, undefined);
  });

  it("never overwrites: a second run with the same timestamp is refused before any write", async () => {
    const { deps, state } = fakeWorld();
    await runBackup(deps, { s3Prefix: "patnamakhana" });
    const before = JSON.stringify([...state.s3.entries(), state.backupCollections]);
    await assert.rejects(runBackup(deps, { s3Prefix: "patnamakhana" }), /already exists/);
    assert.equal(JSON.stringify([...state.s3.entries(), state.backupCollections]), before);
  });

  it("a later run leaves the earlier snapshot untouched (append-only)", async () => {
    const { deps, state } = fakeWorld();
    await runBackup(deps, { s3Prefix: "patnamakhana" });
    const first = JSON.stringify(state.backupCollections);
    deps.now = () => at("2026-10-18T03:00:00Z");
    await runBackup(deps, { s3Prefix: "patnamakhana" });
    assert.equal(JSON.stringify(state.backupCollections.slice(0, 3)), first);
    assert.equal(state.s3.size, 6);
  });

  it("a failed upload stops the run: no completion marker, so cleanup refuses", async () => {
    const { deps, state } = fakeWorld({
      s3PutNew: async () => {
        throw new Error("AccessDenied");
      },
    });
    await assert.rejects(runBackup(deps, { s3Prefix: "patnamakhana" }), /Upload archive[\s\S]*AccessDenied/);
    assert.deepEqual(state.markers, []);
    const plan = planCleanup(state.backupCollections.map((c) => c.name), deps.now(), "20261011T030000Z");
    assert.ok(plan.refused);
    assert.deepEqual(plan.drop, []);
  });

  it("an upload that S3 reports with the wrong checksum fails verification", async () => {
    const { deps, state } = fakeWorld();
    const realHead = deps.s3Head;
    deps.s3Head = async (key) => ({ ...(await realHead(key)), sha256Base64: "wrong" });
    await assert.rejects(runBackup(deps, { s3Prefix: "patnamakhana" }), /SHA-256 in S3 does not match/);
    assert.deepEqual(state.markers, []);
  });

  it("a snapshot that doesn't match the source fails before anything is uploaded", async () => {
    const { deps, state } = fakeWorld();
    const realRestore = deps.restore;
    deps.restore = async (path, id) => {
      await realRestore(path, id);
      state.backupCollections[0].count -= 1;
    };
    await assert.rejects(runBackup(deps, { s3Prefix: "patnamakhana" }), /snapshot does not match/);
    assert.equal(state.s3.size, 0);
    assert.deepEqual(state.markers, []);
  });

  it("a source that changes during the dump is reported, before restore or upload", async () => {
    let reads = 0;
    const { deps, state } = fakeWorld();
    const realStats = deps.sourceStats;
    deps.sourceStats = async () => {
      const stats = await realStats();
      if (++reads > 1) stats[1].count += 1; // an enquiry arrived mid-dump
      return stats;
    };
    await assert.rejects(runBackup(deps, { s3Prefix: "patnamakhana" }), /Confirm the source did not change/);
    assert.equal(state.backupCollections.length, 0);
    assert.equal(state.s3.size, 0);
  });
});
