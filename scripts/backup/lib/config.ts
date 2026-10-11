// Required configuration, validated without printing any values.

import { BACKUP_DB, SOURCE_DB } from "./naming";
import { assertUriDatabase, normalizeMongoUri } from "./mongoUri";

type Env = Record<string, string | undefined>;

export interface BackupConfig {
  backupUri: string;
  s3Bucket: string;
  s3Prefix: string;
  awsRegion: string;
}

export interface RetentionConfig {
  retentionUri: string;
}

function required(env: Env, names: string[]): Record<string, string> {
  const missing = names.filter((name) => !env[name]?.trim());
  if (missing.length) throw new Error(`Missing required configuration: ${missing.join(", ")}`);
  return Object.fromEntries(names.map((name) => [name, env[name]!.trim()]));
}

export function loadBackupConfig(env: Env): BackupConfig {
  const values = required(env, ["MONGODB_BACKUP_URI", "S3_BACKUP_BUCKET", "S3_BACKUP_PREFIX", "AWS_REGION"]);
  assertUriDatabase(values.MONGODB_BACKUP_URI, SOURCE_DB, "MONGODB_BACKUP_URI");
  if (!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(values.S3_BACKUP_BUCKET)) {
    throw new Error("S3_BACKUP_BUCKET is not a valid bucket name");
  }
  if (values.S3_BACKUP_BUCKET === "itarintakes") {
    // The media bucket has a public-read policy: never store database backups there.
    throw new Error("S3_BACKUP_BUCKET must be a private backup bucket, not the public media bucket");
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9/_-]*$/.test(values.S3_BACKUP_PREFIX)) {
    throw new Error("S3_BACKUP_PREFIX may contain only letters, digits, '/', '_' and '-'");
  }
  return {
    backupUri: normalizeMongoUri(values.MONGODB_BACKUP_URI),
    s3Bucket: values.S3_BACKUP_BUCKET,
    s3Prefix: values.S3_BACKUP_PREFIX,
    awsRegion: values.AWS_REGION,
  };
}

export function loadRetentionConfig(env: Env): RetentionConfig {
  const values = required(env, ["MONGODB_RETENTION_URI"]);
  assertUriDatabase(values.MONGODB_RETENTION_URI, BACKUP_DB, "MONGODB_RETENTION_URI");
  return { retentionUri: normalizeMongoUri(values.MONGODB_RETENTION_URI) };
}
