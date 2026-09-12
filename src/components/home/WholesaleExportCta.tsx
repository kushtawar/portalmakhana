import Link from "next/link";
import Container from "@/components/layout/Container";

export default function WholesaleExportCta() {
  return (
    <section className="py-14">
      <Container>
        <div className="grid gap-6 rounded-2xl bg-gradient-to-r from-primary via-primary-dark to-primary-deep px-6 py-10 text-white sm:grid-cols-2 sm:px-10">
          <div>
            <h2 className="text-2xl font-semibold">Wholesale &amp; Distribution</h2>
            <p className="mt-2 text-sm text-white/90">
              Recurring supply, commercial terms and territory support for
              distributors and retailers.
            </p>
            <Link
              href="/wholesale"
              className="mt-4 inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-white/90"
            >
              Enquire for wholesale
            </Link>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Export</h2>
            <p className="mt-2 text-sm text-white/90">
              Bulk and private-label export supply, with documentation and
              packaging support for international buyers.
            </p>
            <Link
              href="/export"
              className="mt-4 inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-white/90"
            >
              Enquire for export
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
