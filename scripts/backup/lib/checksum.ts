// SHA-256 checksums for backup archives.

import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";

export async function sha256File(path: string): Promise<string> {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk as Buffer);
  return hash.digest("hex");
}

/** Content of a .sha256 file, in `shasum -a 256 -c` format. */
export function checksumFileContent(hexDigest: string, archivePath: string): string {
  return `${hexDigest}  ${basename(archivePath)}\n`;
}

/** Hex digest from a .sha256 file's content. */
export function parseChecksumFile(content: string): string {
  const digest = content.trim().split(/\s+/)[0] ?? "";
  if (!/^[0-9a-f]{64}$/.test(digest)) throw new Error("Checksum file does not contain a SHA-256 digest");
  return digest;
}

/** Recompute an archive's digest and compare it with its .sha256 file. */
export async function verifyChecksum(archivePath: string, checksumPath: string): Promise<boolean> {
  const expected = parseChecksumFile(await readFile(checksumPath, "utf8"));
  return (await sha256File(archivePath)) === expected;
}

/** S3 reports SHA-256 checksums base64-encoded. */
export const hexToBase64 = (hex: string) => Buffer.from(hex, "hex").toString("base64");
