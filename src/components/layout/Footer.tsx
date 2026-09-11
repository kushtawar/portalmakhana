import Link from "next/link";
import Container from "@/components/layout/Container";

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All products" },
      { href: "/wholesale", label: "Wholesale" },
      { href: "/export", label: "Export" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "Our story" },
      { href: "/stories", label: "Stories & recipes" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Policies",
    links: [
      { href: "/policies/shipping-returns", label: "Shipping & returns" },
      { href: "/policies/refunds", label: "Cancellation & refunds" },
      { href: "/policies/privacy", label: "Privacy policy" },
      { href: "/policies/terms", label: "Terms & conditions" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-ivory">
      <Container className="grid grid-cols-2 gap-8 py-12 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <p className="text-lg font-bold text-foreground">
            Itar<span className="text-primary">Intakes</span>
          </p>
          <p className="mt-2 max-w-xs text-sm text-foreground-muted">
            Premium Makhana from Patna. 10+ years of sourcing and quality
            experience, delivered pan-India and beyond.
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-sm font-semibold text-foreground">{column.title}</p>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-muted hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-border">
        <Container className="flex flex-col gap-2 py-6 text-xs text-foreground-muted sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} ItarIntakes. All rights reserved.</p>
          <p>Prices are inclusive of applicable GST unless stated otherwise.</p>
        </Container>
      </div>
    </footer>
  );
}
