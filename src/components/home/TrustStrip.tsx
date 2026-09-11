import Container from "@/components/layout/Container";

const POINTS = [
  { title: "10+ years", detail: "Makhana sourcing experience" },
  { title: "Graded quality", detail: "Consistent, premium grading" },
  { title: "GST-ready", detail: "Transparent, invoice-ready pricing" },
  { title: "Secure payments", detail: "Verified online checkout" },
  { title: "Pan-India & global", detail: "Retail, wholesale and export" },
  { title: "No hidden charges", detail: "Clear pricing, always" },
];

export default function TrustStrip() {
  return (
    <section className="border-y border-border bg-ivory">
      <Container className="grid grid-cols-2 gap-6 py-8 sm:grid-cols-3 lg:grid-cols-6">
        {POINTS.map((point) => (
          <div key={point.title} className="text-center sm:text-left">
            <p className="text-sm font-semibold text-foreground">{point.title}</p>
            <p className="text-xs text-foreground-muted">{point.detail}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}
