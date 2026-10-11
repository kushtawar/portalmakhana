// Connection-string handling for the backup tools. Values are never printed.
//
// MongoDB passwords may contain characters (e.g. "ü") that the Node driver tolerates
// unencoded but mongodump/mongorestore (Go) do not, so user and password are always
// percent-encoded. The database is never taken from the URI path: the backup tools are
// given explicit database and namespace arguments instead.

import { databaseNameFromUri } from "../../lib/targetDatabase";

const URI = /^(mongodb(?:\+srv)?:\/\/)(?:([^:@/]+)(?::([^@]*))?@)?([^/?]+)(\/[^?]*)?(\?.*)?$/;

function encodePart(value: string): string {
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    // Contains a literal "%" that isn't an escape — encode it as-is.
  }
  return encodeURIComponent(decoded);
}

/** Percent-encode the credentials and remove any database path (query string kept). */
export function normalizeMongoUri(uri: string): string {
  const match = URI.exec(uri.trim());
  if (!match) throw new Error("Connection string is not a mongodb:// or mongodb+srv:// URI");
  const [, scheme, user, password, hosts, , query = ""] = match;
  const credentials = user ? `${encodePart(user)}${password !== undefined ? `:${encodePart(password)}` : ""}@` : "";
  return `${scheme}${credentials}${hosts}/${query}`;
}

/**
 * The backup URIs may name no database, or the database the step works on. Anything else
 * (e.g. another application's database on the shared cluster) is refused.
 */
export function assertUriDatabase(uri: string, allowed: string, label: string): void {
  const named = databaseNameFromUri(uri);
  if (named && named !== allowed) {
    throw new Error(`${label} names database "${named}", expected none or "${allowed}"`);
  }
}

/** For logs: scheme and host count only. */
export function describeUri(uri: string): string {
  const match = URI.exec(uri.trim());
  if (!match) return "(invalid connection string)";
  return `${match[1]}<credentials hidden>@${match[4].split(",").length} host(s)`;
}
