import "server-only";
import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function getClient() {
  const region = process.env.APP_REGION;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error("S3 is not configured (APP_REGION/S3_ACCESS_KEY_ID/S3_SECRET_ACCESS_KEY missing)");
  }
  return new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
}

export function publicMediaUrl(key: string): string {
  const bucket = process.env.S3_BUCKET_NAME;
  const region = process.env.APP_REGION;
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export async function uploadPublicMedia(
  folder: string,
  file: File
): Promise<{ url: string; key: string }> {
  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    throw new Error("Unsupported file type. Use JPEG, PNG or WebP.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File is too large (max 5MB).");
  }

  const bucket = process.env.S3_BUCKET_NAME;
  if (!bucket) throw new Error("S3_BUCKET_NAME is not configured");

  const key = `media/${folder}/${randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })
  );

  return { url: publicMediaUrl(key), key };
}

export async function deletePublicMedia(key: string): Promise<void> {
  const bucket = process.env.S3_BUCKET_NAME;
  if (!bucket) throw new Error("S3_BUCKET_NAME is not configured");
  await getClient().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
