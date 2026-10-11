// Structural checks of infrastructure/backup/backup-infrastructure.yaml that guard the
// security decisions reviewed in infrastructure/backup/README.md. The template is also
// validated with cfn-lint, `aws cloudformation validate-template` and IAM Access Analyzer;
// these tests stop a later edit from silently weakening it. Text-based (no YAML library).

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const template = readFileSync("infrastructure/backup/backup-infrastructure.yaml", "utf8");

/** Lines of a top-level resource, from "  Name:" up to the next "  OtherName:". */
function resource(name: string): string {
  const lines = template.split("\n");
  const start = lines.findIndex((line) => line === `  ${name}:`);
  assert.ok(start >= 0, `resource ${name} not found`);
  const end = lines.findIndex((line, i) => i > start && /^ {2}[A-Za-z]/.test(line));
  return lines.slice(start, end === -1 ? undefined : end).join("\n");
}

/** One policy statement, from its "- Sid: X" line to the next statement or policy. */
function statement(sid: string): string {
  const lines = template.split("\n");
  const start = lines.findIndex((line) => line.trim() === `- Sid: ${sid}`);
  assert.ok(start >= 0, `statement ${sid} not found`);
  const indent = lines[start].indexOf("-");
  const end = lines.findIndex((line, i) => i > start && line.trim() !== "" && line.search(/\S/) <= indent);
  return lines.slice(start, end === -1 ? undefined : end).join("\n");
}

describe("backup infrastructure template", () => {
  it("retains the bucket, its policy and the shared OIDC provider when the stack is deleted", () => {
    for (const name of ["BackupBucket", "BackupBucketPolicy", "GitHubOIDCProvider"]) {
      const block = resource(name);
      assert.match(block, /^ {4}DeletionPolicy: Retain$/m, `${name} DeletionPolicy`);
      assert.match(block, /^ {4}UpdateReplacePolicy: Retain$/m, `${name} UpdateReplacePolicy`);
    }
  });

  it("restricts s3:ListBucket to the backup prefix with StringLike (not IfExists)", () => {
    const list = statement("ListBackupPrefixOnly");
    assert.match(list, /Action: s3:ListBucket/);
    assert.match(list, /^\s+StringLike:$/m);
    assert.doesNotMatch(list, /IfExists/);
    assert.match(list, /s3:prefix: !Sub "\$\{BackupPrefix\}\/itarintakes\/\*"/);
    assert.doesNotMatch(template, /StringLikeIfExists/);
  });

  it("scopes upload and read-back to the backup prefix and grants no other S3 actions", () => {
    assert.match(statement("UploadNewBackupObjects"), /Action: s3:PutObject\n\s+Resource: !Sub "\$\{BackupBucket\.Arn\}\/\$\{BackupPrefix\}\/itarintakes\/\*"/);
    assert.match(statement("ReadBackBackupObjects"), /Action: s3:GetObject\n\s+Resource: !Sub "\$\{BackupBucket\.Arn\}\/\$\{BackupPrefix\}\/itarintakes\/\*"/);
    const role = resource("BackupRole");
    const allowed = [...role.matchAll(/Effect: Allow\n\s+Action: (\S+)/g)].map((m) => m[1]);
    assert.deepEqual(allowed.sort(), ["s3:GetObject", "s3:ListBucket", "s3:PutObject"]);
    assert.doesNotMatch(role, /Action: "?s3:\*"?/);
  });

  it("explicitly denies deletes and retention changes to the role and to everyone", () => {
    const roleDeny = statement("ExplicitlyNoDeletesRetentionOrAdmin");
    for (const action of ["s3:DeleteObject", "s3:DeleteObjectVersion", "s3:PutObjectRetention", "s3:BypassGovernanceRetention", "s3:PutBucketPolicy", "s3:PutLifecycleConfiguration"]) {
      assert.match(roleDeny, new RegExp(`- ${action}$`, "m"), action);
    }
    assert.match(statement("DenyObjectDeletion"), /Principal: "\*"[\s\S]*- s3:DeleteObjectVersion/);
    assert.match(statement("DenyRetentionChanges"), /- s3:PutBucketObjectLockConfiguration/);
  });

  it("keeps Object Lock COMPLIANCE at 35 days and lifecycle expiry after it", () => {
    assert.match(template, /Mode: COMPLIANCE/);
    assert.match(template, /ObjectLockDays: 35/);
    const expiry = Number(/ExpireCurrentAfterDays: (\d+)/.exec(template)![1]);
    assert.ok(expiry > 35, "lifecycle expiry must be later than the lock");
    assert.match(template, /ExpiredObjectDeleteMarker: true/);
    assert.match(template, /AbortIncompleteMultipartUpload/);
  });

  it("trusts only the repository's backup environment via OIDC", () => {
    const role = resource("BackupRole");
    assert.match(role, /token\.actions\.githubusercontent\.com:aud: sts\.amazonaws\.com/);
    assert.match(role, /token\.actions\.githubusercontent\.com:sub: !Sub "repo:\$\{GitHubRepository\}:environment:\$\{GitHubEnvironment\}"/);
    assert.match(role, /Action: sts:AssumeRoleWithWebIdentity/);
    assert.doesNotMatch(role, /StringLike:\n\s+token\.actions/, "no wildcard subject");
  });

  it("blocks all public access on the bucket", () => {
    const bucket = resource("BackupBucket");
    for (const key of ["BlockPublicAcls", "BlockPublicPolicy", "IgnorePublicAcls", "RestrictPublicBuckets"]) {
      assert.match(bucket, new RegExp(`${key}: true`), key);
    }
  });
});
