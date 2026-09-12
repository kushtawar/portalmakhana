import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-muted">
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-display text-lg font-semibold text-foreground">
            Itar<span className="text-primary">Intakes</span>{" "}
            <span className="text-sm font-normal text-foreground-muted">Admin</span>
          </Link>
          {session ? (
            <nav className="hidden items-center gap-4 text-sm font-medium text-foreground-muted sm:flex">
              <Link href="/admin" className="hover:text-primary">
                Dashboard
              </Link>
              <Link href="/admin/products" className="hover:text-primary">
                Products
              </Link>
              <Link href="/admin/inventory" className="hover:text-primary">
                Inventory
              </Link>
              <Link href="/admin/promotions" className="hover:text-primary">
                Promotions
              </Link>
              <Link href="/admin/banners" className="hover:text-primary">
                Banners
              </Link>
              <Link href="/admin/articles" className="hover:text-primary">
                Stories
              </Link>
              <Link href="/admin/enquiries" className="hover:text-primary">
                Enquiries
              </Link>
            </nav>
          ) : null}
        </div>

        {session ? (
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button
              type="submit"
              className="text-sm font-medium text-foreground-muted hover:text-primary"
            >
              Log out
            </button>
          </form>
        ) : null}
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
