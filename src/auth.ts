import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// TEMP: distinct codes to diagnose a reported login failure without
// logging any secret values. Auth.js surfaces `.code` to the client via
// signIn()'s returned `code` field. Collapse back to a single `return null`
// once resolved - see AGENTS/PR notes.
class BadInputSignin extends CredentialsSignin {
  code = "bad-input";
}
class MissingEnvSignin extends CredentialsSignin {
  code = "missing-env";
}
class BadEmailSignin extends CredentialsSignin {
  code = "bad-email";
}
class BadPasswordSignin extends CredentialsSignin {
  constructor(hashLength: number) {
    super();
    this.code = `bad-password-hashlen-${hashLength}`;
  }
  code: string;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  trustHost: true,
  providers: [
    Credentials({
      name: "Admin credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          throw new BadInputSignin();
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
        if (!adminEmail || !adminPasswordHash) {
          throw new MissingEnvSignin();
        }

        if (email !== adminEmail) {
          throw new BadEmailSignin();
        }

        const valid = await bcrypt.compare(password, adminPasswordHash);
        if (!valid) {
          throw new BadPasswordSignin(adminPasswordHash.length);
        }

        return { id: "admin", email: adminEmail, name: "Admin" };
      },
    }),
  ],
});
