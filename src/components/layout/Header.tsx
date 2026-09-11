"use client";

import Link from "next/link";
import { useState } from "react";
import Container from "@/components/layout/Container";
import { useCart } from "@/lib/cart/CartContext";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/wholesale", label: "Wholesale" },
  { href: "/export", label: "Export" },
  { href: "/stories", label: "Stories" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-baseline gap-1 text-lg font-bold text-foreground">
          Itar<span className="text-primary">Intakes</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
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
            {itemCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white">
                {itemCount}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-muted md:hidden"
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
        <nav className="border-t border-border bg-background md:hidden">
          <Container className="flex flex-col py-2">
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
    </header>
  );
}
