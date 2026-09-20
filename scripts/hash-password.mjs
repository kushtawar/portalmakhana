import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs 'YourNewPassword'");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);

// Both .env.local and Amplify's environment variable go through a
// $-expanding env loader (Next.js's own @next/env locally; Amplify's
// build-time env dump remotely) - a bare $ in the value gets treated as
// the start of a variable reference and silently eaten. Escaping every $
// as \$ here is what actually survives that pass intact in both places.
const escaped = hash.replace(/\$/g, "\\$");

console.log("Paste this into BOTH .env.local and the Amplify environment variable:");
console.log(escaped);
