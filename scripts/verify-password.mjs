import { readFileSync } from "node:fs";
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/verify-password.mjs 'YourPassword'");
  process.exit(1);
}

const envContent = readFileSync(".env.local", "utf8");
const match = envContent.match(/^ADMIN_PASSWORD_HASH=(.+)$/m);
if (!match) {
  console.error("ADMIN_PASSWORD_HASH not found in .env.local");
  process.exit(1);
}

// .env.local stores the $-escaped form (see hash-password.mjs) - Next.js's
// own env loader un-escapes it back to a real bcrypt hash before the app
// ever sees it, so mirror that here rather than comparing the raw file value.
const hash = match[1].trim().replace(/\\\$/g, "$");
console.log("Hash in .env.local matches this password:", bcrypt.compareSync(password, hash));
