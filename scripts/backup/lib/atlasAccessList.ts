// Temporary Atlas IP access-list entry for the GitHub runner that runs the backup.
//
// Safety rules (all unit-tested):
// - Only a single, valid, public IPv4 address is ever added (stored by Atlas as /32) —
//   never 0.0.0.0/0, a CIDR range, a private address or anything else.
// - Every entry gets an automatic expiry (~1 hour) and a comment naming the workflow run.
// - If the address is already on the list, nothing is added and nothing will be removed.
// - Removal deletes only the exact address added by THIS run, and only if the entry's
//   comment still matches this run; anything else is left alone.

import { createHash, randomBytes } from "node:crypto";

export const ATLAS_API = "https://cloud.mongodb.com/api/atlas/v2";
export const ATLAS_ACCEPT = "application/vnd.atlas.2023-01-01+json";
export const ENTRY_LIFETIME_MINUTES = 60;
const COMMENT_PREFIX = "itarintakes-backup gh-run";

/** True only for a dotted-quad IPv4 address that is publicly routable. */
export function isPublicIPv4(value: string): boolean {
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(value);
  if (!match) return false;
  const [a, b, c, d] = match.slice(1).map(Number);
  if ([a, b, c, d].some((n) => n > 255) || match.slice(1).some((part) => part.length > 1 && part.startsWith("0"))) return false;
  if (a === 0 || a === 10 || a === 127 || a >= 224) return false; // this-network, private, loopback, multicast/reserved
  if (a === 100 && b >= 64 && b <= 127) return false; // carrier-grade NAT
  if (a === 169 && b === 254) return false; // link-local
  if (a === 172 && b >= 16 && b <= 31) return false; // private
  if (a === 192 && b === 168) return false; // private
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return false; // IETF / documentation
  if (a === 198 && (b === 18 || b === 19)) return false; // benchmarking
  if ((a === 198 && b === 51 && c === 100) || (a === 203 && b === 0 && c === 113)) return false; // documentation
  return true;
}

export const runComment = (runId: string, attempt: string) => `${COMMENT_PREFIX} ${runId}-${attempt}`;

export interface AccessListEntryRequest {
  ipAddress: string;
  comment: string;
  deleteAfterDate: string;
}

/** The one entry this run may add. Throws for anything but a public IPv4 address. */
export function buildRunnerEntry(ip: string, now: Date, runId: string, attempt: string): AccessListEntryRequest {
  if (!isPublicIPv4(ip)) throw new Error("Runner address is not a single public IPv4 address — refusing to add it");
  if (!/^\d+$/.test(runId) || !/^\d+$/.test(attempt)) throw new Error("Invalid workflow run id");
  return {
    ipAddress: ip,
    comment: runComment(runId, attempt),
    deleteAfterDate: new Date(now.getTime() + ENTRY_LIFETIME_MINUTES * 60_000).toISOString(),
  };
}

export interface AccessListEntry {
  ipAddress?: string;
  cidrBlock?: string;
  comment?: string;
  deleteAfterDate?: string;
}

/** Remove only the exact entry this run created (same address, same run comment). */
export function isOwnEntry(entry: AccessListEntry | null, ip: string, comment: string): boolean {
  if (!entry) return false;
  const address = entry.ipAddress ?? entry.cidrBlock?.replace(/\/32$/, "");
  return address === ip && entry.comment === comment;
}

/** Whether a list of entries includes an "allow from anywhere" rule. */
export function allowsEverywhere(entries: AccessListEntry[]): boolean {
  return entries.some((e) => e.cidrBlock === "0.0.0.0/0" || e.ipAddress === "0.0.0.0");
}

// ---- HTTP Digest authentication (Atlas programmatic API keys) -----------------------------

const md5 = (value: string) => createHash("md5").update(value).digest("hex");

export function parseDigestChallenge(header: string): Record<string, string> {
  const params: Record<string, string> = {};
  for (const [, key, quoted, bare] of header.replace(/^Digest\s+/i, "").matchAll(/(\w+)=(?:"([^"]*)"|([^,\s]*))/g)) {
    params[key.toLowerCase()] = quoted ?? bare;
  }
  return params;
}

export function digestAuthorization(
  challenge: Record<string, string>,
  credentials: { username: string; password: string },
  method: string,
  uriPath: string,
  cnonce = randomBytes(8).toString("hex")
): string {
  const nc = "00000001";
  const qop = challenge.qop?.split(",").map((q) => q.trim()).includes("auth") ? "auth" : undefined;
  const ha1 = md5(`${credentials.username}:${challenge.realm}:${credentials.password}`);
  const ha2 = md5(`${method}:${uriPath}`);
  const response = qop
    ? md5(`${ha1}:${challenge.nonce}:${nc}:${cnonce}:${qop}:${ha2}`)
    : md5(`${ha1}:${challenge.nonce}:${ha2}`);
  const parts = [
    `username="${credentials.username}"`,
    `realm="${challenge.realm}"`,
    `nonce="${challenge.nonce}"`,
    `uri="${uriPath}"`,
    `response="${response}"`,
    ...(challenge.algorithm ? [`algorithm=${challenge.algorithm}`] : []),
    ...(challenge.opaque ? [`opaque="${challenge.opaque}"`] : []),
    ...(qop ? [`qop=${qop}`, `nc=${nc}`, `cnonce="${cnonce}"`] : []),
  ];
  return `Digest ${parts.join(", ")}`;
}

// ---- Atlas Admin API client ---------------------------------------------------------------

export type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body?: string }) => Promise<{
  status: number;
  headers: { get(name: string): string | null };
  text(): Promise<string>;
}>;

export class AtlasApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
  }
}

export class AtlasAccessListClient {
  constructor(
    private readonly fetchImpl: FetchLike,
    private readonly projectId: string,
    private readonly credentials: { username: string; password: string }
  ) {
    if (!/^[0-9a-f]{24}$/.test(projectId)) throw new Error("ATLAS_PROJECT_ID must be a 24-character Atlas project id");
  }

  private async request(method: string, path: string, body?: unknown): Promise<{ status: number; json: unknown }> {
    const url = `${ATLAS_API}/groups/${this.projectId}${path}`;
    const headers: Record<string, string> = { Accept: ATLAS_ACCEPT };
    if (body !== undefined) headers["Content-Type"] = ATLAS_ACCEPT;
    const init = { method, headers, body: body === undefined ? undefined : JSON.stringify(body) };

    let response = await this.fetchImpl(url, init);
    if (response.status === 401) {
      const challenge = response.headers.get("www-authenticate");
      if (!challenge || !/^Digest/i.test(challenge)) throw new AtlasApiError(401, "Atlas API did not offer Digest authentication");
      const uriPath = new URL(url).pathname + new URL(url).search;
      headers.Authorization = digestAuthorization(parseDigestChallenge(challenge), this.credentials, method, uriPath);
      response = await this.fetchImpl(url, { ...init, headers });
    }
    const text = await response.text();
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }
    if (response.status >= 400 && response.status !== 404) {
      // Report the API's error code only — never request details or credentials.
      const code = (json as { errorCode?: string } | null)?.errorCode ?? "unknown error";
      throw new AtlasApiError(response.status, `Atlas API ${method} access list failed: HTTP ${response.status} (${code})`);
    }
    return { status: response.status, json };
  }

  async getEntry(ip: string): Promise<AccessListEntry | null> {
    const { status, json } = await this.request("GET", `/accessList/${encodeURIComponent(ip)}`);
    return status === 404 ? null : (json as AccessListEntry);
  }

  async listEntries(): Promise<AccessListEntry[]> {
    const { json } = await this.request("GET", "/accessList?itemsPerPage=500");
    return ((json as { results?: AccessListEntry[] } | null)?.results ?? []) as AccessListEntry[];
  }

  async addEntry(entry: AccessListEntryRequest): Promise<void> {
    await this.request("POST", "/accessList", [entry]);
  }

  async entryStatus(ip: string): Promise<string> {
    const { status, json } = await this.request("GET", `/accessList/${encodeURIComponent(ip)}/status`);
    return status === 404 ? "NOT_FOUND" : String((json as { STATUS?: string } | null)?.STATUS ?? "UNKNOWN");
  }

  async deleteEntry(ip: string): Promise<void> {
    await this.request("DELETE", `/accessList/${encodeURIComponent(ip)}`);
  }
}

// ---- The two workflow operations ----------------------------------------------------------

export interface AllowResult {
  ip: string;
  comment: string;
  /** True only if this run added the entry (and so must remove it). */
  created: boolean;
}

/**
 * Add the runner's address (unless already present) and wait until Atlas reports it ACTIVE.
 * `onCreated` is called as soon as the entry exists, so the cleanup step can still remove it
 * if waiting for ACTIVE then fails.
 */
export async function allowRunner(
  client: AtlasAccessListClient,
  options: {
    ip: string;
    now: Date;
    runId: string;
    attempt: string;
    onCreated: (result: AllowResult) => Promise<void>;
    sleep?: (ms: number) => Promise<void>;
    timeoutMs?: number;
    log?: (message: string) => void;
  }
): Promise<AllowResult> {
  const log = options.log ?? (() => {});
  const sleep = options.sleep ?? ((ms: number) => new Promise((resolve) => setTimeout(resolve, ms)));
  const entry = buildRunnerEntry(options.ip, options.now, options.runId, options.attempt);

  let created = false;
  if (await client.getEntry(entry.ipAddress)) {
    log("The runner's address is already on the access list — nothing added, nothing will be removed.");
  } else {
    await client.addEntry(entry);
    created = true;
    await options.onCreated({ ip: entry.ipAddress, comment: entry.comment, created });
    log(`Added a temporary access-list entry for this runner (expires ${entry.deleteAfterDate}).`);
  }

  const deadline = Date.now() + (options.timeoutMs ?? 180_000);
  for (;;) {
    const status = await client.entryStatus(entry.ipAddress);
    if (status === "ACTIVE") break;
    if (status === "FAILED" || status === "NOT_FOUND") throw new Error(`Access-list entry status is ${status}`);
    if (Date.now() > deadline) throw new Error("Timed out waiting for the access-list entry to become ACTIVE");
    await sleep(5_000);
  }
  return { ip: entry.ipAddress, comment: entry.comment, created };
}

/** Remove the entry this run added. Never touches any other entry. */
export async function revokeRunner(
  client: AtlasAccessListClient,
  options: { ip: string; comment: string; log?: (message: string) => void }
): Promise<"removed" | "already-gone" | "not-ours"> {
  const log = options.log ?? (() => {});
  if (!isPublicIPv4(options.ip)) throw new Error("Refusing to remove: not a single public IPv4 address");
  const entry = await client.getEntry(options.ip);
  if (!entry) {
    log("The temporary entry is already gone (expired or removed).");
    return "already-gone";
  }
  if (!isOwnEntry(entry, options.ip, options.comment)) {
    log("An entry for this address exists but was not created by this run — left untouched.");
    return "not-ours";
  }
  await client.deleteEntry(options.ip);
  log("Removed this run's temporary access-list entry.");
  return "removed";
}
