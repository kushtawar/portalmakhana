// Guard for maintenance scripts that can write to MongoDB.
//
// The Atlas cluster is shared with other applications, so a write-mode (--apply) run must
// name its target database twice: once in MONGODB_URI and once as --db=<name>. The two must
// match, otherwise the script stops before writing anything. Only the database *name* is
// ever printed — never the connection string.

export interface ScriptTarget {
  apply: boolean;
  databaseName: string;
}

/** Database name from the URI path (mongodb://host/<db>?…), or "" if none is given. */
export function databaseNameFromUri(uri: string): string {
  const afterScheme = uri.split("://")[1] ?? "";
  const hostAndPath = afterScheme.slice(afterScheme.lastIndexOf("@") + 1);
  const path = hostAndPath.split("?")[0];
  const slash = path.indexOf("/");
  return slash === -1 ? "" : decodeURIComponent(path.slice(slash + 1));
}

/**
 * Validate the run mode and target before connecting. Throws with a clear message if a
 * write would be ambiguous; preview mode only requires a database name in the URI.
 */
export function resolveScriptTarget(argv: string[], uri: string | undefined): ScriptTarget {
  if (!uri) throw new Error("MONGODB_URI is not set");
  const apply = argv.includes("--apply");
  const confirm = argv.find((arg) => arg.startsWith("--db="))?.slice("--db=".length);
  const databaseName = databaseNameFromUri(uri);

  if (!databaseName) {
    throw new Error(
      "MONGODB_URI does not name a database (…mongodb.net/<database>?…). Refusing to run: " +
        "the driver would silently fall back to the 'test' database."
    );
  }
  if (apply && confirm !== databaseName) {
    throw new Error(
      `--apply needs --db=<database> matching the database in MONGODB_URI. ` +
        `Target is "${databaseName}"; got ${confirm ? `"${confirm}"` : "no --db"}. Nothing was written.`
    );
  }
  return { apply, databaseName };
}

/** Re-check after connecting that the driver really is on the expected database. */
export function assertConnectedDatabase(target: ScriptTarget, connectedName: string) {
  if (connectedName !== target.databaseName) {
    throw new Error(
      `Connected to "${connectedName}" but expected "${target.databaseName}". Nothing was written.`
    );
  }
}
