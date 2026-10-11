// Temporary Atlas access-list entry for the backup runner. A fake Atlas API is used; no
// network access happens.

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";
import {
  AtlasAccessListClient,
  ENTRY_LIFETIME_MINUTES,
  allowRunner,
  allowsEverywhere,
  buildRunnerEntry,
  digestAuthorization,
  isPublicIPv4,
  parseDigestChallenge,
  revokeRunner,
  runComment,
  type AccessListEntry,
  type FetchLike,
} from "../scripts/backup/lib/atlasAccessList";

const PROJECT = "0123456789abcdef01234567";
const CREDS = { username: "pubkey", password: "private-key-value" };
const RUNNER_IP = "20.51.100.7";
const NOW = new Date("2026-10-18T03:00:00Z");

interface Call {
  method: string;
  path: string;
  body?: string;
  auth?: string;
}

/** Minimal fake of the Atlas access-list API, with Digest authentication. */
function fakeAtlas(
  initial: AccessListEntry[] = [],
  options: { failOn?: string; failStatus?: number; statuses?: string[] } = {}
) {
  const entries = new Map(initial.map((e) => [e.ipAddress ?? e.cidrBlock!.replace(/\/32$/, ""), { ...e }]));
  const calls: Call[] = [];
  const statuses = [...(options.statuses ?? ["ACTIVE"])];
  const respond = (status: number, body?: unknown, headers: Record<string, string> = {}) => ({
    status,
    headers: { get: (name: string) => headers[name.toLowerCase()] ?? null },
    text: async () => (body === undefined ? "" : JSON.stringify(body)),
  });
  const fetchImpl: FetchLike = async (url, init) => {
    const path = new URL(url).pathname.replace(`/api/atlas/v2/groups/${PROJECT}`, "");
    if (!init.headers.Authorization) {
      return respond(401, undefined, { "www-authenticate": 'Digest realm="MMS Public API", nonce="abc", algorithm=MD5, qop="auth"' });
    }
    calls.push({ method: init.method, path, body: init.body, auth: init.headers.Authorization });
    if (options.failOn === init.method) return respond(options.failStatus ?? 500, { errorCode: "UNEXPECTED_ERROR" });
    const ip = decodeURIComponent(path.split("/")[2] ?? "");
    if (init.method === "POST") {
      for (const e of JSON.parse(init.body!) as AccessListEntry[]) entries.set(e.ipAddress!, { ...e, cidrBlock: `${e.ipAddress}/32` });
      return respond(201, { results: [] });
    }
    if (init.method === "GET" && path === "/accessList") return respond(200, { results: [...entries.values()] });
    if (init.method === "GET" && path.endsWith("/status")) return respond(entries.has(ip) ? 200 : 404, { STATUS: statuses.shift() ?? "ACTIVE" });
    if (init.method === "GET") return entries.has(ip) ? respond(200, entries.get(ip)) : respond(404, { errorCode: "NOT_FOUND" });
    if (init.method === "DELETE") return entries.delete(ip) ? respond(204) : respond(404, { errorCode: "NOT_FOUND" });
    return respond(400);
  };
  return { client: new AtlasAccessListClient(fetchImpl, PROJECT, CREDS), entries, calls };
}

const allow = (atlas: ReturnType<typeof fakeAtlas>, extra: Partial<Parameters<typeof allowRunner>[1]> = {}) => {
  const recorded: { created?: boolean; comment?: string } = {};
  return allowRunner(atlas.client, {
    ip: RUNNER_IP,
    now: NOW,
    runId: "123456",
    attempt: "1",
    sleep: async () => {},
    onCreated: async (r) => void Object.assign(recorded, r),
    ...extra,
  }).then((result) => ({ result, recorded }));
};

describe("what may be added", () => {
  it("accepts only a single public IPv4 address", () => {
    for (const ok of ["20.51.100.7", "8.8.8.8", "52.29.1.1"]) assert.equal(isPublicIPv4(ok), true, ok);
    for (const bad of ["0.0.0.0", "0.0.0.0/0", "20.51.100.7/32", "10.1.2.3", "172.16.0.1", "192.168.1.1", "127.0.0.1", "169.254.1.1", "100.64.0.1", "224.0.0.1", "255.255.255.255", "256.1.1.1", "01.2.3.4", "::1", "", "20.51.100"]) {
      assert.equal(isPublicIPv4(bad), false, bad);
    }
  });

  it("never builds an entry for 0.0.0.0/0, a range or a private address", () => {
    for (const bad of ["0.0.0.0", "0.0.0.0/0", "10.0.0.1", "20.51.100.0/24"]) {
      assert.throws(() => buildRunnerEntry(bad, NOW, "1", "1"), /public IPv4/);
    }
  });

  it("sets an automatic expiry about one hour ahead and a run-specific comment", () => {
    const entry = buildRunnerEntry(RUNNER_IP, NOW, "123456", "2");
    assert.deepEqual(entry, {
      ipAddress: RUNNER_IP,
      comment: "itarintakes-backup gh-run 123456-2",
      deleteAfterDate: new Date(NOW.getTime() + ENTRY_LIFETIME_MINUTES * 60_000).toISOString(),
    });
    assert.equal(ENTRY_LIFETIME_MINUTES, 60);
    assert.ok(!("cidrBlock" in entry));
  });
});

describe("allow and revoke", () => {
  it("adds the entry, waits for ACTIVE, then removes exactly that entry", async () => {
    const atlas = fakeAtlas([{ cidrBlock: "203.0.114.0/24", comment: "office" }], { statuses: ["PENDING", "ACTIVE"] });
    const { result, recorded } = await allow(atlas);
    assert.equal(result.created, true);
    assert.equal(recorded.created, true, "recorded for the cleanup step before waiting");
    const post = atlas.calls.find((c) => c.method === "POST")!;
    assert.deepEqual(JSON.parse(post.body!), [buildRunnerEntry(RUNNER_IP, NOW, "123456", "1")]);

    assert.equal(await revokeRunner(atlas.client, { ip: RUNNER_IP, comment: result.comment }), "removed");
    assert.deepEqual([...atlas.entries.keys()], ["203.0.114.0/24"], "unrelated entry untouched");
    const deletes = atlas.calls.filter((c) => c.method === "DELETE");
    assert.equal(deletes.length, 1);
    assert.equal(deletes[0].path, `/accessList/${RUNNER_IP}`);
  });

  it("cleans up after a failed backup (revoke runs unconditionally)", async () => {
    const atlas = fakeAtlas();
    const { result } = await allow(atlas);
    // …the backup step fails here; the always() revoke step still runs:
    assert.equal(await revokeRunner(atlas.client, { ip: result.ip, comment: result.comment }), "removed");
    assert.equal(atlas.entries.size, 0);
  });

  it("does not add or remove anything when the address is already allowed", async () => {
    const atlas = fakeAtlas([{ ipAddress: RUNNER_IP, cidrBlock: `${RUNNER_IP}/32`, comment: "someone else" }]);
    const { result, recorded } = await allow(atlas);
    assert.equal(result.created, false);
    assert.equal(recorded.created, undefined);
    assert.ok(!atlas.calls.some((c) => c.method === "POST"));
    assert.equal(await revokeRunner(atlas.client, { ip: RUNNER_IP, comment: result.comment }), "not-ours");
    assert.ok(atlas.entries.has(RUNNER_IP), "existing entry kept");
    assert.ok(!atlas.calls.some((c) => c.method === "DELETE"));
  });

  it("treats an entry that has already expired as cleaned up", async () => {
    const atlas = fakeAtlas();
    const { result } = await allow(atlas);
    atlas.entries.clear(); // Atlas removed it at deleteAfterDate
    assert.equal(await revokeRunner(atlas.client, { ip: result.ip, comment: result.comment }), "already-gone");
    assert.ok(!atlas.calls.some((c) => c.method === "DELETE"));
  });

  it("never removes an entry for the same address created by another run", async () => {
    const atlas = fakeAtlas();
    await allow(atlas);
    atlas.entries.set(RUNNER_IP, { ipAddress: RUNNER_IP, comment: runComment("999", "1") });
    assert.equal(await revokeRunner(atlas.client, { ip: RUNNER_IP, comment: runComment("123456", "1") }), "not-ours");
    assert.ok(atlas.entries.has(RUNNER_IP));
  });

  it("refuses to revoke anything that isn't a single public IPv4", async () => {
    const atlas = fakeAtlas([{ cidrBlock: "0.0.0.0/0" }]);
    await assert.rejects(revokeRunner(atlas.client, { ip: "0.0.0.0/0", comment: "x" }), /public IPv4/);
    assert.equal(atlas.calls.length, 0);
  });
});

describe("API failures fail safely", () => {
  it("a failed create stops the run and leaves nothing to clean up", async () => {
    const atlas = fakeAtlas([], { failOn: "POST", failStatus: 403 });
    let recorded = false;
    await assert.rejects(
      allowRunner(atlas.client, { ip: RUNNER_IP, now: NOW, runId: "1", attempt: "1", sleep: async () => {}, onCreated: async () => void (recorded = true) }),
      /HTTP 403 \(UNEXPECTED_ERROR\)/
    );
    assert.equal(recorded, false);
    assert.equal(atlas.entries.size, 0);
  });

  it("an entry that never becomes ACTIVE fails the run, but is already recorded for cleanup", async () => {
    const atlas = fakeAtlas([], { statuses: ["FAILED"] });
    let recorded = false;
    await assert.rejects(
      allowRunner(atlas.client, { ip: RUNNER_IP, now: NOW, runId: "1", attempt: "1", sleep: async () => {}, onCreated: async () => void (recorded = true) }),
      /status is FAILED/
    );
    assert.equal(recorded, true, "the revoke step will remove it");
  });

  it("times out waiting for ACTIVE", async () => {
    const atlas = fakeAtlas([], { statuses: Array(100).fill("PENDING") });
    await assert.rejects(allow(atlas, { timeoutMs: -1 }), /Timed out/);
  });

  it("a failed delete is reported (the entry still expires automatically)", async () => {
    const atlas = fakeAtlas();
    const { result } = await allow(atlas);
    const failing = fakeAtlas([...atlas.entries.values()], { failOn: "DELETE" });
    await assert.rejects(revokeRunner(failing.client, { ip: result.ip, comment: result.comment }), /HTTP 500/);
    assert.ok(failing.entries.get(RUNNER_IP)?.deleteAfterDate, "entry carries its own expiry");
  });

  it("error messages contain no credentials", async () => {
    const atlas = fakeAtlas([], { failOn: "POST" });
    await assert.rejects(allow(atlas), (e: Error) => !e.message.includes(CREDS.password) && !e.message.includes(CREDS.username));
  });

  it("rejects a malformed project id before any request", () => {
    assert.throws(() => new AtlasAccessListClient(async () => { throw new Error("no"); }, "not-a-project", CREDS), /24-character/);
  });
});

describe("Digest authentication and reporting", () => {
  it("computes the RFC 2617 qop=auth response", () => {
    const challenge = parseDigestChallenge('Digest realm="MMS Public API", nonce="abc", algorithm=MD5, qop="auth"');
    assert.deepEqual(challenge, { realm: "MMS Public API", nonce: "abc", algorithm: "MD5", qop: "auth" });
    const header = digestAuthorization(challenge, CREDS, "GET", "/api/atlas/v2/groups/x/accessList", "cnonce1");
    const md5 = (v: string) => createHash("md5").update(v).digest("hex");
    const expected = md5(`${md5("pubkey:MMS Public API:private-key-value")}:abc:00000001:cnonce1:auth:${md5("GET:/api/atlas/v2/groups/x/accessList")}`);
    assert.match(header, new RegExp(`response="${expected}"`));
    assert.ok(!header.includes(CREDS.password), "the private key is never sent");
  });

  it("detects an allow-from-anywhere rule", () => {
    assert.equal(allowsEverywhere([{ cidrBlock: "0.0.0.0/0" }]), true);
    assert.equal(allowsEverywhere([{ cidrBlock: "20.51.100.7/32" }]), false);
  });
});
