# PatnaMakhana — `itarintakes` database backups and restore

Automated weekly backups of the `itarintakes` MongoDB database (and only that database) on
the shared Atlas cluster, with two independent copies:

| Copy | Where | Purpose |
|---|---|---|
| Atlas snapshot | database `itarintakes_backups`, collections `snapshot_<id>_<collection>` | Fast inspection / restore of individual records |
| Archive | private S3 bucket, `<prefix>/itarintakes/YYYY/MM/DD/itarintakes_<id>.archive.gz` (+ `.sha256`, `.manifest.json`) | Off-cluster copy for full recovery |

`<id>` is the UTC start time, e.g. `20261011T030000Z`. Every run gets new names; nothing is
ever overwritten.

Code: [`scripts/backup/`](../scripts/backup) · Workflow:
[`.github/workflows/weekly-itarintakes-backup.yml`](../.github/workflows/weekly-itarintakes-backup.yml) ·
Tests: [`tests/backup.test.ts`](../tests/backup.test.ts) (`npm test`).

## Schedule and retention

- **When:** every Sunday at 03:00 UTC (GitHub Actions cron `0 3 * * 0`), plus manual runs
  (*Actions → Weekly itarintakes backup → Run workflow*). Nothing runs on a laptop.
- **Atlas snapshots:** removed only when **more than 35 days old** — a snapshot exactly 35
  days old is kept. Weekly runs therefore keep about 5–6 snapshots. Cleanup runs only after
  the new backup is verified, uploaded and marked complete.
- **S3 archives:** the upload role cannot delete anything. Expiry is done by the bucket's
  lifecycle rule (36 days) and, if enabled, Object Lock prevents deletion for 35 days.
- GitHub may delay scheduled runs at busy times, and **disables schedules on public
  repositories after 60 days without repository activity** — re-enable from the Actions tab.

## What each run does

1. Checks all required settings are present (prints names only).
2. Installs pinned, checksum-verified MongoDB Database Tools; adds the runner's own IP
   address to the Atlas access list for about an hour (see *Network access to Atlas*);
   gets short-lived AWS credentials through GitHub OIDC (no stored AWS keys).
3. Refuses to continue if the snapshot or any S3 key for this `<id>` already exists (exact
   key match via a prefix-restricted listing; any listing error stops the run).
4. Reads the source's collections, document counts, indexes and a **content fingerprint**
   per collection (SHA-256 over every document in `_id` order) — read-only.
5. `mongodump --db=itarintakes` → compressed archive; computes its SHA-256.
6. Re-reads the source. If anything changed during the dump — a document inserted,
   deleted **or updated**, or an index changed — the run retries once with a new id
   (see *Consistency* below).
7. `mongorestore` into new collections `itarintakes_backups.snapshot_<id>_*` — no `--drop`;
   an existing collection makes it fail instead of being replaced.
8. Verifies every collection's document count, index definitions and content fingerprint
   against the source — the snapshot must be document-for-document identical.
9. Uploads the archive, checksum and manifest to S3 with `If-None-Match: *` (fails rather
   than overwrite) and S3-side SHA-256; then verifies size and checksum of each object.
10. Creates `snapshot_<id>__manifest` (the manifest) — this marks the snapshot complete.
11. Only then: retention cleanup drops expired `snapshot_*` collections one by one by exact
    name. It refuses to run if the new snapshot isn't complete, never drops the database,
    and ignores any collection not matching `snapshot_<YYYYMMDDTHHMMSSZ>_*`.
12. Always, whatever happened above: removes the temporary Atlas access-list entry this run
    added.

Any failure stops the job with a `::error::` annotation and a failed run (GitHub emails the
person who last changed the workflow schedule when a scheduled run fails — check your GitHub notification settings); cleanup is skipped. A failed run may leave an
incomplete snapshot (no `__manifest`) or partial S3 objects; they are never treated as
complete and expire by the normal rules.

The repository is public, so workflow logs are public. Logs contain only totals, sizes,
S3 keys, checksums and collection names. Connection strings are never printed and are also
registered with the runner's log masking (including the percent-encoded form); MongoDB tool
errors are sanitised before logging — quoted values and `{…}` document fragments (which a
duplicate-key error could use to quote, say, an email address) are removed. Per-collection
counts, indexes and fingerprints are only in the manifest (private S3 and Atlas).

## Consistency — what is and isn't guaranteed

`mongodump` reads collections one after another; without `--oplog` it is **not** a
point-in-time snapshot, and `--oplog` is not an option here (it requires dumping the whole
deployment, not one database, and shared-tier Atlas clusters don't expose the oplog).

What the job guarantees instead: the source's per-collection fingerprints are read before
and after the dump, and the restored snapshot must match them exactly. So a run is only
marked complete if **no document was inserted, deleted or updated anywhere in
`itarintakes` between the two reads**, and the snapshot is identical to that state — i.e. a
consistent copy. If the data keeps changing, the run retries once and then fails loudly
rather than storing an inconsistent backup. (Only a change that is exactly reverted
between the two reads could go unnoticed, which is not a realistic risk at 03:00 UTC on a
small catalogue.) The database is tiny (≈ 50 documents), so reading it three times takes
seconds. If it grows to many gigabytes, revisit this (e.g. snapshot reads with
`readConcern: "snapshot"`, or a dedicated cluster tier with Atlas Cloud Backup).

## Network access to Atlas

GitHub-hosted runners have no fixed IP address, and the job must not depend on Atlas being
open to `0.0.0.0/0`. Options considered:

| Option | Atlas exposure | Cost | Setup |
|---|---|---|---|
| **GitHub runner + temporary access-list entry (recommended)** | only the runner's own `/32`, for the job's duration (auto-expires) | $0 | Atlas API key as a secret; two workflow steps |
| AWS EC2 (t4g.nano) with an Elastic IP, started weekly | one fixed `/32`, permanently | ≈ US$4–5/month (public IPv4 ≈ $3.65, disk ≈ $0.80, compute pennies) | EC2, EventBridge Scheduler, SSM, IAM, patching |
| AWS Lambda/Fargate in a VPC behind a NAT gateway | one fixed `/32` | ≈ US$35+/month (NAT gateway) | VPC, NAT, scheduler |
| Atlas Private Endpoint (PrivateLink) | none public | requires a dedicated M10+ cluster (≈ US$57+/month) | VPC endpoint |

**Implemented:** GitHub Actions with a temporary access-list entry
([`scripts/backup/atlas-access-list.ts`](../scripts/backup/atlas-access-list.ts), tested in
[`tests/atlas-access-list.test.ts`](../tests/atlas-access-list.test.ts)):

1. *Allow this runner in Atlas* — looks up the runner's public IPv4
   (checkip.amazonaws.com, fallback api.ipify.org) and adds exactly that address (/32) with
   `deleteAfterDate` = now + 60 minutes and the comment
   `itarintakes-backup gh-run <run id>-<attempt>`, then waits until Atlas reports it
   `ACTIVE`. If the address is already on the list, nothing is added (and nothing will be
   removed). If the entry can't be created or doesn't become active, the job fails before
   the backup starts.
2. *Remove this runner from Atlas* — runs unconditionally at the end (also after a failed,
   timed-out or cancelled backup) when step 1 created an entry, and deletes that exact
   address only if its comment still matches this run. An already-expired entry counts as
   cleaned up. If removal itself fails, the entry still expires on its own within the hour.

Guarantees: only a single public IPv4 address is ever added — never `0.0.0.0/0`, a range,
or a private address; no other entry is ever modified or removed; the API key is masked in
logs and errors report only HTTP status and Atlas error codes.

Note: if the Atlas access list already contains `0.0.0.0/0` (common when the website runs
on AWS Amplify, which has no fixed outbound IP), that exposure comes from the website, not
the backup; tightening it is a separate decision.

## Initial setup (requires approval — nothing here has been done yet)

### 1. Private S3 bucket

The existing `itarintakes` bucket is **not suitable**: it serves product images through a
public-read bucket policy, has no versioning, Object Lock or lifecycle rules, and the
configuration refuses it explicitly. Create a dedicated bucket, e.g.
`patnamakhana-db-backups-<account-id>` in `eu-central-1`:

- **Object Ownership:** bucket owner enforced (ACLs disabled).
- **Block Public Access:** all four settings on.
- **Default encryption:** SSE-S3 (or SSE-KMS; the upload role then also needs
  `kms:GenerateDataKey`/`kms:Decrypt` on the key).
- **Versioning:** enabled.
- **Object Lock:** enabled at creation, default retention **COMPLIANCE, 35 days**. Uploads
  then can't be deleted or overwritten by anyone, including the account root, for 35 days.
  (GOVERNANCE mode can be used instead if administrators must be able to override.)
- **Lifecycle configuration** on the backup prefix (S3 doesn't allow `Days` and
  `ExpiredObjectDeleteMarker` in the same rule, hence two rules):

```json
{
  "Rules": [
    { "ID": "expire-backups", "Status": "Enabled",
      "Filter": { "Prefix": "patnamakhana/itarintakes/" },
      "Expiration": { "Days": 36 },
      "NoncurrentVersionExpiration": { "NoncurrentDays": 1 },
      "AbortIncompleteMultipartUpload": { "DaysAfterInitiation": 1 } },
    { "ID": "remove-expired-delete-markers", "Status": "Enabled",
      "Filter": { "Prefix": "patnamakhana/itarintakes/" },
      "Expiration": { "ExpiredObjectDeleteMarker": true } }
  ]
}
```

  Timeline for one upload: locked (COMPLIANCE) until day 35 → on day ~36 lifecycle adds a
  delete marker (allowed; the locked version is not deleted) → about a day later the now
  noncurrent version is permanently deleted (its lock has expired) → the leftover delete
  marker is removed. Lifecycle never removes a version that is still locked; timings are
  approximate because lifecycle runs asynchronously. Uploads are single `PutObject`
  requests, so incomplete multipart uploads shouldn't occur; the abort rule is a safeguard.
  Every upload sends a SHA-256 checksum, which satisfies Object Lock's integrity-header
  requirement. With COMPLIANCE mode the bucket can't be emptied or deleted early.
- **Bucket policy:** deny any request without TLS (`aws:SecureTransport = false`).

Without Object Lock, the protection is: versioning + an upload role with no delete
permission + the lifecycle rule as the only remover. That is weaker: an administrator could
still delete objects early.

### 2. GitHub OIDC and the upload role (AWS IAM)

- Add the identity provider `token.actions.githubusercontent.com`
  (audience `sts.amazonaws.com`). It doesn't exist in the account yet.
- Create role `patnamakhana-itarintakes-backup` with this trust policy — only this
  repository's `itarintakes-backup` environment can assume it:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Federated": "arn:aws:iam::<account-id>:oidc-provider/token.actions.githubusercontent.com" },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
        "token.actions.githubusercontent.com:sub": "repo:kushtawar/portalmakhana:environment:itarintakes-backup"
      }
    }
  }]
}
```

- Permission policy — upload and read back, no delete, no retention changes:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::<backup-bucket>/patnamakhana/itarintakes/*" },
    { "Effect": "Allow", "Action": "s3:ListBucket", "Resource": "arn:aws:s3:::<backup-bucket>",
      "Condition": { "StringLike": { "s3:prefix": "patnamakhana/itarintakes/*" } } }
  ]
}
```

`s3:ListBucket` (only with a prefix under `patnamakhana/itarintakes/`) serves the pre-run
"does this key already exist?" check, which lists `--prefix <exact key>` and requires an
exact key match; listing errors stop the run. Do not grant `s3:DeleteObject*`, `s3:PutObjectRetention`,
`s3:PutObjectLegalHold` or `s3:BypassGovernanceRetention`.

### 3. MongoDB Atlas users

Create two database users (Atlas → Database Access), authenticating against `admin`:

| User | Access | Used by |
|---|---|---|
| `itarintakes-backup` | **read** on `itarintakes`; on `itarintakes_backups`: `find`, `insert`, `createCollection`, `createIndex`, `listCollections`, `listIndexes` (custom role) | backup step |
| `itarintakes-retention` | on `itarintakes_backups`: `listCollections`, `dropCollection` (custom role); **no access** to `itarintakes` | cleanup step |

Neither user can write to the live `itarintakes` database. The retention user's
`dropCollection` applies to the whole `itarintakes_backups` database (MongoDB can't limit it
to a name prefix); the cleanup script is what restricts it to expired `snapshot_*`
collections, and it never runs unless the new snapshot is complete. **Limitation:** MongoDB
privileges apply per database or collection, not "new collections only", so the backup user
could insert into an existing snapshot collection; it cannot update, delete or drop. The S3
copy (Object Lock) is the tamper-resistant one. If the cluster tier doesn't offer custom
roles, use the built-in `read@itarintakes` + `readWrite@itarintakes_backups` for backup and
`readWrite@itarintakes_backups` for retention, and accept that those can also update or drop
snapshots.

Atlas **Network Access** must allow GitHub-hosted runners (their IPs vary). If the IP access
list is restricted, the backup cannot connect.

Connection strings may contain special or non-ASCII characters in the password; the
scripts percent-encode user and password before passing them to the MongoDB tools. Give
the URIs without a database path or with `/itarintakes` (backup) or
`/itarintakes_backups` (retention); any other database is refused.

### 4. Atlas Admin API key (for the temporary access-list entry)

Atlas → your project → **Project Access Manager → Applications → API Keys → Create API
Key** — a **project** key (not an organization key), with only the project role that
manages the IP access list: **Project Network Access Manager**
(`GROUP_NETWORK_ACCESS_MANAGER`). If your Atlas UI doesn't offer that role, stop and review
before using a broader one: Project Owner can also manage users and clusters. The key needs
no database access.

- The key's own *API Access List* can't be restricted to GitHub's runners (their addresses
  change), so leave the organization setting *Require IP Access List for the Atlas
  Administration API* off for this key, protect it as an environment secret, rotate it
  periodically, and enable an Atlas alert for access-list changes.
- The script authenticates with HTTP Digest (the standard for Atlas API keys) against the
  Atlas Administration API v2.
- **Read-only check of the current list** (once the key exists; enter the private key at a
  hidden prompt so it isn't stored in shell history):

  ```bash
  export ATLAS_PROJECT_ID=<24-character project id> ATLAS_PUBLIC_KEY=<public key>
  read -rs ATLAS_PRIVATE_KEY && export ATLAS_PRIVATE_KEY
  node --import tsx scripts/backup/atlas-access-list.ts report
  ```

  It lists the entries and states whether `0.0.0.0/0` is present. (Equivalent in the UI:
  Atlas → Security → Network Access.)

### 5. GitHub configuration

Create environment **`itarintakes-backup`** (Settings → Environments) with *Deployment
branches and tags → Selected branches → `main`* (the `main` branch currently has no branch
protection, so use the explicit branch rule rather than "Protected branches only").
Environment secrets are then only given to this workflow when it runs from `main`; a run
from any other branch is refused. Optionally add yourself as a *required reviewer* to
approve each manual run. Then add:

| Kind | Name | Value |
|---|---|---|
| Environment secret | `MONGODB_BACKUP_URI` | `mongodb+srv://itarintakes-backup:<password>@<cluster-host>/` |
| Environment secret | `MONGODB_RETENTION_URI` | `mongodb+srv://itarintakes-retention:<password>@<cluster-host>/` |
| Environment variable | `AWS_ROLE_ARN` | ARN of the upload role |
| Environment variable | `AWS_REGION` | `eu-central-1` |
| Environment variable | `S3_BACKUP_BUCKET` | the private backup bucket |
| Environment variable | `S3_BACKUP_PREFIX` | `patnamakhana` |
| Environment secret | `ATLAS_PUBLIC_KEY` | Atlas API public key |
| Environment secret | `ATLAS_PRIVATE_KEY` | Atlas API private key |
| Environment variable | `ATLAS_PROJECT_ID` | Atlas project id (24 hex characters) |
| **Repository** variable | `BACKUP_ENABLED` | `true` — only once everything above is in place |

### 6. Activating safely

- Scheduled and manually triggered workflows only run from the default branch, so the
  workflow file has to be merged to `main`.
- Until the repository variable `BACKUP_ENABLED` is `true`, the job is skipped entirely —
  merging the workflow alone changes nothing and causes no failing Sunday runs.
- AWS Amplify builds the website automatically on every push to `main`. This change adds
  no application code (only the workflow, scripts, tests and docs), so a build would
  produce the same site; to avoid even that, end the merge commit message with
  **`[skip-cd]`**, which tells Amplify to skip building that commit (or pause automatic
  builds in the Amplify console for the merge).
- Order: complete setup 1–5 → merge to `main` with `[skip-cd]` → set
  `BACKUP_ENABLED=true` → *Actions → Weekly itarintakes backup → Run workflow* → check the
  summary, that the temporary Atlas entry is gone, and that the three S3 objects exist →
  restore drill (below).

## Restoring

Never restore into the live `itarintakes` database as part of checking a backup, and never
use `--drop` against it. Restore into a **separate recovery database**, verify it, and only
then decide — explicitly — how to use it.

Prerequisites: MongoDB Database Tools (`brew install mongodb/brew/mongodb-database-tools`),
the AWS CLI with read access to the backup bucket, and this repository (for the verify
script). Put the connection string in an environment variable, percent-encoding the
password if it has special or non-ASCII characters; never paste it into logs.

### A. One snapshot from Atlas into a recovery database

```bash
ID=20261011T030000Z                                  # snapshot to restore
RECOVERY_DB=itarintakes_recovery_$ID
mongodump --uri="$MONGODB_BACKUP_URI" --db=itarintakes_backups --gzip --archive=snapshots.archive.gz
mongorestore --uri="$RECOVERY_URI" --gzip --archive=snapshots.archive.gz \
  --nsInclude="itarintakes_backups.snapshot_${ID}_*" \
  --nsExclude="itarintakes_backups.snapshot_${ID}__manifest" \
  --nsFrom="itarintakes_backups.snapshot_${ID}_\$coll\$" --nsTo="${RECOVERY_DB}.\$coll\$"
```

Use a **local** MongoDB for `RECOVERY_URI` (e.g. the replica set described in
`docs/PHASE1_TESTING.md`) so recovery never writes to the production cluster. The only
production access is the read-only `mongodump` above. Then verify the recovery database —
counts, indexes and content fingerprints — against the manifest, taken from S3 or exported
from the snapshot's marker:

```bash
mongoexport --uri="$MONGODB_BACKUP_URI" --db=itarintakes_backups \
  --collection="snapshot_${ID}__manifest" --jsonArray --out=manifest.json
RESTORE_CHECK_URI="$RECOVERY_URI" node --import tsx scripts/backup/verify-itarintakes-backup.ts \
  --manifest=manifest.json --restored-db="$RECOVERY_DB"
```

### B. Full recovery from S3

```bash
ID=20261011T030000Z; DAY=${ID:0:4}/${ID:4:2}/${ID:6:2}
BASE=s3://<backup-bucket>/patnamakhana/itarintakes/$DAY/itarintakes_$ID
aws s3 cp "$BASE.archive.gz" . && aws s3 cp "$BASE.archive.gz.sha256" . && aws s3 cp "$BASE.manifest.json" .

# 1. Integrity
shasum -a 256 -c "itarintakes_$ID.archive.gz.sha256"

# 2. Restore into a recovery database
mongorestore --uri="$RECOVERY_URI" --gzip --archive="itarintakes_$ID.archive.gz" \
  --nsInclude='itarintakes.*' --nsFrom='itarintakes.$coll$' --nsTo="itarintakes_recovery_$ID.\$coll\$"

# 3. Verify archive + restored data against the manifest (counts and indexes)
RESTORE_CHECK_URI="$RECOVERY_URI" node --import tsx scripts/backup/verify-itarintakes-backup.ts \
  --archive="itarintakes_$ID.archive.gz" --checksum="itarintakes_$ID.archive.gz.sha256" \
  --manifest="itarintakes_$ID.manifest.json" --restored-db="itarintakes_recovery_$ID"
```

Use a local `RECOVERY_URI` here too: nothing in this procedure writes to production. The
verify script checks the archive against the `.sha256` and the manifest, then the recovery
database's collections, document counts, index definitions and content fingerprints against
the manifest, and it refuses `--restored-db=itarintakes`.

### Putting recovered data back into service

This is a deliberate, approved decision — never automatic. Options, least to most invasive:

1. Copy individual documents from the recovery database back with the admin UI or a
   reviewed script.
2. Replace specific collections from the verified recovery database, after taking a fresh
   backup of the current state first. This discards edits made since the backup.
3. Point the application at the recovery database (change the database in Amplify's
   `MONGODB_URI`) and redeploy.

Product-level rollback (single product versions) is a separate feature and does not use
these backups.

## Testing

`npm test` runs `tests/backup.test.ts` with fakes only (no database or AWS): unique names
and append-only behaviour, source database selection, namespace remapping, checksums,
count/index/content-fingerprint verification, detection of updates during the dump,
sanitised log output, retention boundaries (exactly 35 days kept), cleanup limited to
snapshot collections, and failed uploads blocking cleanup. A first real run should be a
manual workflow run after setup, followed by a restore drill (B) into a recovery database.
