import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductImagePlaceholder from "@/components/product/ProductImagePlaceholder";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "ItarIntakes is a premium Makhana business rooted in Patna, with over 10 years of sourcing and quality experience.",
};

export default function AboutPage() {
  return (
    <Container className="py-12">
      <SectionHeading eyebrow="About Us" title="Our story" />

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-4 text-sm leading-relaxed text-foreground-muted">
          <p>
            ItarIntakes is a premium Makhana business based in Patna, India.
            Our journey with fox nuts began more than a decade ago, working
            closely with local growers and processors to understand grading,
            drying and roasting — the details that decide whether a pack of
            Makhana is merely average or genuinely premium.
          </p>
          <p>
            Over the years we built a business supplying regional and
            wholesale buyers across East India. ItarIntakes brings that same
            sourcing discipline to a direct-to-consumer online store, along
            with dedicated wholesale, distribution and export channels for
            business partners.
          </p>
          <p>
            We keep our pricing transparent, our packaging practical, and our
            claims honest — no exaggerated marketing, just consistent
            quality from a team that has been doing this for a long time.
          </p>
        </div>
        <ProductImagePlaceholder label="Our Patna Team" className="aspect-[4/3] w-full rounded-2xl" />
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        {[
          { title: "Sourcing", detail: "Direct relationships with growers and processors in Patna." },
          { title: "Grading", detail: "Consistent grading standards across every batch we pack." },
          { title: "Capability", detail: "Retail, wholesale, distribution and export, from one supply chain." },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-border p-6">
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            <p className="mt-2 text-sm text-foreground-muted">{item.detail}</p>
          </div>
        ))}
      </div>
    </Container>
  );
}
