import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import FaqAccordion from "@/components/contact/FaqAccordion";

export const metadata: Metadata = {
  title: "Contact & FAQ",
  description: "Get in touch with ItarIntakes, or find answers to common questions.",
};

const ENQUIRY_EMAIL = "hello@innovatetoday.net";

export default function ContactPage() {
  return (
    <Container className="py-12">
      <SectionHeading eyebrow="Contact" title="Get in touch" />

      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-border p-5">
          <p className="text-sm font-semibold text-foreground">Email</p>
          <a
            href={`mailto:${ENQUIRY_EMAIL}`}
            className="mt-1 block text-sm text-primary hover:text-primary-dark"
          >
            {ENQUIRY_EMAIL}
          </a>
        </div>
        <div className="rounded-xl border border-border p-5">
          <p className="text-sm font-semibold text-foreground">Phone / WhatsApp</p>
          <p className="mt-1 text-sm text-foreground-muted">To be confirmed</p>
        </div>
        <div className="rounded-xl border border-border p-5">
          <p className="text-sm font-semibold text-foreground">Based in</p>
          <p className="mt-1 text-sm text-foreground-muted">Patna, Bihar, India</p>
        </div>
      </div>

      <div className="mt-14">
        <SectionHeading title="Frequently asked questions" />
        <div className="mt-6">
          <FaqAccordion />
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-4 text-sm text-foreground-muted">
        <span>See also:</span>
        <Link href="/policies/shipping-returns" className="text-primary hover:text-primary-dark">
          Shipping &amp; Returns
        </Link>
        <Link href="/policies/refunds" className="text-primary hover:text-primary-dark">
          Cancellation &amp; Refunds
        </Link>
        <Link href="/policies/privacy" className="text-primary hover:text-primary-dark">
          Privacy Policy
        </Link>
        <Link href="/policies/terms" className="text-primary hover:text-primary-dark">
          Terms &amp; Conditions
        </Link>
      </div>
    </Container>
  );
}
