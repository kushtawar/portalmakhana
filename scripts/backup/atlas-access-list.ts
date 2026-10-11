// Temporary Atlas IP access-list entry for the backup workflow's runner (rules:
// lib/atlasAccessList.ts). Needs ATLAS_PUBLIC_KEY, ATLAS_PRIVATE_KEY (project-scoped API key)
// and ATLAS_PROJECT_ID.
//
//   allow   — add this runner's public IPv4 (/32, ~1 h expiry) and wait until ACTIVE.
//             Writes created/ip/comment to $GITHUB_OUTPUT for the revoke step.
//   revoke  — remove exactly that entry (ALLOW_IP, ALLOW_COMMENT), if still present and ours.
//   report  — read-only: number of entries and whether 0.0.0.0/0 is allowed.

import { appendFile } from "node:fs/promises";
import {
  AtlasAccessListClient,
  allowRunner,
  allowsEverywhere,
  isPublicIPv4,
  revokeRunner,
  type FetchLike,
} from "./lib/atlasAccessList";

const IP_SOURCES = ["https://checkip.amazonaws.com", "https://api.ipify.org"];

function client(): AtlasAccessListClient {
  const missing = ["ATLAS_PUBLIC_KEY", "ATLAS_PRIVATE_KEY", "ATLAS_PROJECT_ID"].filter((n) => !process.env[n]?.trim());
  if (missing.length) throw new Error(`Missing required configuration: ${missing.join(", ")}`);
  if (process.env.GITHUB_ACTIONS === "true") console.log(`::add-mask::${process.env.ATLAS_PRIVATE_KEY}`);
  return new AtlasAccessListClient(fetch as unknown as FetchLike, process.env.ATLAS_PROJECT_ID!.trim(), {
    username: process.env.ATLAS_PUBLIC_KEY!.trim(),
    password: process.env.ATLAS_PRIVATE_KEY!.trim(),
  });
}

async function runnerIPv4(): Promise<string> {
  for (const source of IP_SOURCES) {
    try {
      const response = await fetch(source, { signal: AbortSignal.timeout(10_000) });
      const ip = (await response.text()).trim();
      if (response.ok && isPublicIPv4(ip)) return ip;
    } catch {
      // try the next source
    }
  }
  throw new Error("Could not determine this runner's public IPv4 address");
}

async function output(values: Record<string, string>) {
  if (!process.env.GITHUB_OUTPUT) return;
  await appendFile(process.env.GITHUB_OUTPUT, Object.entries(values).map(([k, v]) => `${k}=${v}\n`).join(""));
}

async function main() {
  const command = process.argv[2];
  const log = (message: string) => console.log(message);

  if (command === "allow") {
    const atlas = client();
    const ip = await runnerIPv4();
    await output({ ip, created: "false" });
    const result = await allowRunner(atlas, {
      ip,
      now: new Date(),
      runId: process.env.GITHUB_RUN_ID ?? "",
      attempt: process.env.GITHUB_RUN_ATTEMPT ?? "",
      log,
      // Recorded before waiting for ACTIVE, so the revoke step still cleans up if waiting fails.
      onCreated: (created) => output({ created: "true", comment: created.comment }),
    });
    log(`Runner allowed (${result.created ? "temporary entry added" : "address was already allowed"}).`);
  } else if (command === "revoke") {
    const ip = process.env.ALLOW_IP ?? "";
    const comment = process.env.ALLOW_COMMENT ?? "";
    if (!ip || !comment) throw new Error("ALLOW_IP and ALLOW_COMMENT are required");
    await revokeRunner(client(), { ip, comment, log });
  } else if (command === "report") {
    const entries = await client().listEntries();
    log(`Access list: ${entries.length} entr${entries.length === 1 ? "y" : "ies"}.`);
    for (const e of entries) log(`  ${e.cidrBlock ?? e.ipAddress}${e.deleteAfterDate ? ` (expires ${e.deleteAfterDate})` : ""}${e.comment ? ` — ${e.comment}` : ""}`);
    log(allowsEverywhere(entries) ? "0.0.0.0/0 IS on the access list (open to all addresses)." : "0.0.0.0/0 is NOT on the access list.");
  } else {
    throw new Error("Usage: atlas-access-list.ts allow | revoke | report");
  }
}

main().catch((error) => {
  // Messages contain only status codes and Atlas error codes — never keys or request bodies.
  console.error(`::error title=Atlas access list::${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
