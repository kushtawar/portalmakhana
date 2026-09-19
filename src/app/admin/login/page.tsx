"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
      });

      if (result?.error) {
        // TEMP: showing the raw NextAuth error code to debug a login issue.
        // Revert to a generic "Invalid email or password." once resolved.
        setError(`Sign-in failed (${result.error}). Check email/password and try again.`);
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      console.error("Admin sign-in failed:", err);
      setError("Something went wrong signing in. Check the browser console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-border bg-card p-8"
      >
        <p className="font-display text-xl font-semibold text-foreground">
          Itar<span className="text-primary">Intakes</span>
        </p>
        <p className="mt-1 text-sm text-foreground-muted">Admin sign in</p>

        <div className="mt-6 space-y-4">
          <label className="block text-sm text-foreground-muted">
            Email
            <input
              name="email"
              type="text"
              required
              autoComplete="username"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </label>
          <label className="block text-sm text-foreground-muted">
            Password
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </label>
        </div>

        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-gradient-to-r from-primary to-primary-deep px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
