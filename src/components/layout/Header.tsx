"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Container from "@/components/layout/Container";
import { useCart } from "@/lib/cart/CartContext";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/wholesale", label: "Wholesale Order" },
  { href: "/export", label: "Export" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { itemCount } = useCart();
  const router = useRouter();

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = query.trim();
    router.push(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
  };

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-gradient-to-r from-primary-dark to-primary-deep text-white">
        <Container className="flex h-9 items-center justify-between text-xs">
          <p className="flex items-center gap-1.5 truncate">
            <span aria-hidden>🌿</span>
            <span className="truncate">Goodness from Patna, for a Healthier Tomorrow</span>
          </p>
          <div className="hidden items-center gap-4 sm:flex">
            <span>Pan India Delivery</span>
            <span className="text-white/40">|</span>
            <span>Global Supply</span>
            <span className="text-white/40">|</span>
            <span>GST Invoice Available</span>
          </div>
        </Container>
      </div>

      <div className="border-b border-border bg-background/95 backdrop-blur">
        <Container className="flex h-20 items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image src="/brand/logo-mark.png" alt="" width={36} height={36} className="h-9 w-9" />
            <span>
              <p className="font-display text-xl font-semibold text-foreground">
                Itar<span className="text-primary">Intakes</span>
              </p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-foreground-muted">
                Pure Makhana. A Better You.
              </p>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground-muted transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <form
            onSubmit={handleSearch}
            className="hidden flex-1 items-center rounded-full border border-border bg-muted px-4 py-2 md:flex md:max-w-xs"
          >
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for Makhana..."
              className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground-muted focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="text-foreground-muted hover:text-primary"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
                <path d="m21 21-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
          </form>

          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
              aria-label="View cart"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
                <path
                  d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L20 8H6"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9.5" cy="20" r="1.4" fill="currentColor" />
                <circle cx="17" cy="20" r="1.4" fill="currentColor" />
              </svg>
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white">
                {itemCount}
              </span>
            </Link>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-muted lg:hidden"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
                {menuOpen ? (
                  <path
                    d="M6 6l12 12M18 6l-12 12"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </Container>

        {menuOpen ? (
          <nav className="border-t border-border bg-background lg:hidden">
            <Container className="flex flex-col py-2">
              <form onSubmit={handleSearch} className="flex items-center gap-2 py-2">
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search for Makhana..."
                  className="w-full rounded-full border border-border bg-muted px-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none"
                />
              </form>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="py-2.5 text-sm font-medium text-foreground-muted hover:text-primary"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </Container>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
