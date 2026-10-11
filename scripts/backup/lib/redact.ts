// Everything the backup prints goes to PUBLIC GitHub Actions logs (public repository).
// Tool output is sanitised before it is logged: connection strings, quoted values and
// {...} document fragments (MongoDB errors such as duplicate-key errors can quote document
// values, e.g. an email address) are removed.

export function redactToolOutput(text: string, maxLength = 400): string {
  return text
    .replace(/mongodb(\+srv)?:\/\/\S+/gi, "mongodb://<redacted>")
    .replace(/\{[^{}]*\}/g, "{…}")
    .replace(/\{[^{}]*\}/g, "{…}") // nested once more
    .replace(/"[^"\n]*"|'[^'\n]*'/g, "<value>")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/** The secret parts of a connection string: the whole string, user and password (raw and decoded). */
export function secretPartsOfUri(uri: string): string[] {
  const parts = new Set<string>([uri]);
  const match = /^mongodb(?:\+srv)?:\/\/([^:@/]+)(?::([^@]*))?@/.exec(uri);
  for (const value of [match?.[1], match?.[2]]) {
    if (!value) continue;
    parts.add(value);
    try {
      parts.add(decodeURIComponent(value));
    } catch {
      // not percent-encoded
    }
  }
  return [...parts].filter((part) => part.length >= 3);
}

/**
 * Ask the Actions runner to mask these values in all later log output (defence in depth:
 * GitHub masks secrets verbatim, but not derived forms such as a percent-encoded URI).
 */
export function maskInActionsLogs(...uris: string[]): void {
  if (process.env.GITHUB_ACTIONS !== "true") return;
  for (const part of uris.flatMap(secretPartsOfUri)) console.log(`::add-mask::${part}`);
}
