# Backup infrastructure (AWS CloudFormation)

[`backup-infrastructure.yaml`](backup-infrastructure.yaml) creates the AWS side of the weekly
`itarintakes` backup ([`docs/BACKUP_AND_RESTORE.md`](../../docs/BACKUP_AND_RESTORE.md),
workflow [`.github/workflows/weekly-itarintakes-backup.yml`](../../.github/workflows/weekly-itarintakes-backup.yml)).
**Nothing has been deployed.**

| Resource | Purpose |
|---|---|
| S3 bucket (default `patnamakhana-db-backups-916262176087`, `eu-central-1`) | Private backup store: all public access blocked, ACLs disabled, SSE-S3 encryption, versioning, **Object Lock COMPLIANCE 35 days** |
| Bucket lifecycle (2 rules) | Expire current versions after 36 days, delete noncurrent versions 1 day later, remove expired delete markers, abort incomplete multipart uploads after 1 day |
| Bucket policy (retained with the bucket) | Deny non-TLS requests; deny object deletion and retention/Object Lock changes for every principal |
| IAM role `patnamakhana-itarintakes-backup` | Assumed by GitHub Actions via OIDC; upload + read back + list under `<prefix>/itarintakes/` only |
| GitHub OIDC provider (optional) | Created only when `CreateGitHubOIDCProvider=true` |

## Parameters

| Parameter | Default | Must match |
|---|---|---|
| `BucketName` | `patnamakhana-db-backups-916262176087` | workflow variable `S3_BACKUP_BUCKET` (stack output) |
| `BackupPrefix` | `patnamakhana` | workflow variable `S3_BACKUP_PREFIX` |
| `GitHubRepository` | `kushtawar/portalmakhana` | the repository running the workflow |
| `GitHubEnvironment` | `itarintakes-backup` | the workflow job's `environment:` |
| `RoleName` | `patnamakhana-itarintakes-backup` | workflow variable `AWS_ROLE_ARN` (stack output) |
| `CreateGitHubOIDCProvider` | `false` | `true` only if the account has no GitHub provider (see below) |

Retention (35 days), lifecycle expiry (36 days) and the cleanup intervals are fixed in the
template's `Mappings`, not parameters, so expiry can't accidentally be set earlier than the
Object Lock period.

## Security decisions

- **Separate bucket.** The existing `itarintakes` bucket serves product images through a
  public-read policy, so it is never used; the template's name pattern and the backup
  script both refuse it.
- **Object Lock COMPLIANCE, 35 days.** No one — including the account root — can delete or
  overwrite a backup version for 35 days. Object Lock can only be enabled when a bucket is
  created, and can't be turned off afterwards.
- **Lifecycle doesn't conflict with Object Lock.** On day 36 lifecycle only adds a delete
  marker (allowed on locked objects); the version itself is deleted only after it has been
  noncurrent for a day, by which time its lock has ended. Lifecycle never removes a locked
  version and nothing bypasses retention.
- **Role permissions (least privilege)** — exactly what the scripts call:
  - `s3:PutObject` on `<bucket>/<prefix>/itarintakes/*` — `aws s3api put-object
    --if-none-match '*' --checksum-algorithm SHA256`. (The SHA-256 checksum satisfies
    Object Lock's integrity requirement; default retention needs no extra permission.)
  - `s3:GetObject` on the same objects — `head-object --checksum-mode ENABLED`.
  - `s3:ListBucket` only with an `s3:prefix` under `<prefix>/itarintakes/` (`StringLike`):
    the "never overwrite" check runs `list-objects-v2 --prefix <exact new key>` and treats
    the key as existing only on an exact key match. Listings without a prefix or outside the
    backup prefix are denied; any listing error stops the run.
  - Explicit denies: every object/bucket delete, retention and legal-hold changes,
    governance bypass, Object Lock/versioning/lifecycle/policy/ACL/encryption/public-access
    changes, and all IAM/STS-assume/Organizations actions.
- **Trust policy.** Only GitHub's OIDC tokens with audience `sts.amazonaws.com` and subject
  `repo:kushtawar/portalmakhana:environment:itarintakes-backup`. Because the workflow job
  uses that environment, GitHub issues an environment-based subject, not
  `ref:refs/heads/main`. The `main`-only restriction is therefore enforced by the
  environment's deployment-branch rule in GitHub. Sessions last at most 1 hour.
- **Retain on delete.** Deleting the stack keeps the bucket (and backups), its bucket
  policy (so the retained bucket keeps its deny rules), and any OIDC provider it created
  (other roles may depend on it).

## OIDC provider

Checked (read-only) on 2026-10-11: the account has **no**
`token.actions.githubusercontent.com` provider (only EKS providers). IAM allows a single
provider per URL, so the template never creates a duplicate: with `true` and an existing
provider the deployment fails; with `false` it uses the existing provider's ARN without
modifying it. Check immediately before deploying:

```bash
aws iam list-open-id-connect-providers --query 'OpenIDConnectProviderList[].Arn' --output text \
  | tr '\t' '\n' | grep -c 'token.actions.githubusercontent.com'
# 0 → deploy with CreateGitHubOIDCProvider=true ; 1 → use false
```

The provider is created with client id `sts.amazonaws.com` and no thumbprints (AWS
validates GitHub's tokens against its trusted certificate authorities).

## Validate (no AWS changes)

```bash
cd ~/Documents/AllTechnical/Apps/ItarIntakes-rebrand
python3 -m venv /tmp/cfnlint && /tmp/cfnlint/bin/pip install -q cfn-lint
/tmp/cfnlint/bin/cfn-lint infrastructure/backup/backup-infrastructure.yaml
aws cloudformation validate-template --region eu-central-1 \
  --template-body file://infrastructure/backup/backup-infrastructure.yaml
```

Optional, also no changes: create a **change set** and review it before executing anything:

```bash
aws cloudformation create-change-set --region eu-central-1 \
  --stack-name patnamakhana-itarintakes-backup --change-set-type CREATE \
  --change-set-name review-1 --capabilities CAPABILITY_NAMED_IAM \
  --template-body file://infrastructure/backup/backup-infrastructure.yaml \
  --parameters ParameterKey=CreateGitHubOIDCProvider,ParameterValue=true
aws cloudformation describe-change-set --region eu-central-1 \
  --stack-name patnamakhana-itarintakes-backup --change-set-name review-1
# discard it if not approved:
aws cloudformation delete-change-set --region eu-central-1 \
  --stack-name patnamakhana-itarintakes-backup --change-set-name review-1
```

(A change set creates nothing, but it does register a stack in `REVIEW_IN_PROGRESS`;
`delete-change-set` alone leaves that empty stack, removable with `delete-stack`.)

## Deploy (only after approval)

```bash
aws cloudformation deploy --region eu-central-1 \
  --stack-name patnamakhana-itarintakes-backup \
  --template-file infrastructure/backup/backup-infrastructure.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides CreateGitHubOIDCProvider=true   # or false, per the check above
aws cloudformation describe-stacks --region eu-central-1 \
  --stack-name patnamakhana-itarintakes-backup --query 'Stacks[0].Outputs'
```

Copy the outputs into the GitHub environment `itarintakes-backup` as variables
`S3_BACKUP_BUCKET`, `S3_BACKUP_PREFIX`, `AWS_ROLE_ARN` and `AWS_REGION`.

## Not covered by this template (do separately)

- **GitHub:** the `itarintakes-backup` environment, its *Selected branches → `main`* rule,
  secrets and variables, and `BACKUP_ENABLED` (see the backup doc). The `main`-only
  restriction can't be expressed in AWS because GitHub's token subject for an environment
  job doesn't include the branch.
- **MongoDB Atlas:** database users, the API key for the temporary access-list entry.
- **Account-level S3 Block Public Access** is currently not configured for the account;
  this template sets it on the bucket. Turning it on account-wide would affect the public
  `itarintakes` media bucket, so it's out of scope.
- **Irreversible choices:** Object Lock can't be disabled, and COMPLIANCE-locked versions
  can't be deleted early by anyone. **35 days is the minimum, not the maximum, time an
  object is kept:** each version is locked for at least 35 days from upload (longer if a
  later retain-until date is ever applied), and afterwards it is removed only by lifecycle
  — delete marker at about day 36, permanent deletion about a day later, with S3 running
  lifecycle asynchronously (typically within a day or two of eligibility). So a mistaken or
  unwanted upload is typically stored for roughly 37–39 days, and indefinitely if the
  lifecycle rules were ever removed or disabled; manual deletion needs the bucket policy
  changed first. The bucket can't be emptied or deleted before every version has expired.
- **Changing retention later** requires an administrator to remove the `DenyRetentionChanges`
  statement from the bucket policy first; a stack update that changes the Object Lock
  setting fails otherwise (by design).
- **Deliberately deleting a backup** (after its lock ends) likewise requires editing the
  bucket policy first; normally lifecycle removes everything.
- **Prefix must match:** the role's list/put/get permissions are scoped to
  `<BackupPrefix>/itarintakes/`; if the workflow's `S3_BACKUP_PREFIX` differs, every S3
  call is denied and the backup fails before writing anything.
- **Versioned keys:** an exact-key listing shows current versions only. If a key's current
  version were ever a delete marker, the check would not see older versions — but keys are
  unique per run (UTC timestamp), uploads use `If-None-Match: *`, and Object Lock keeps
  every earlier version regardless, so nothing can be overwritten.
