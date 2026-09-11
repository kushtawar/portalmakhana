import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";

const REASONS = [
  {
    title: "Decade-long grading experience",
    detail:
      "We've been sourcing and grading Makhana from Patna for 10+ years, long before we opened this online store.",
  },
  {
    title: "Quality first",
    detail:
      "Every batch is checked for grade, size and freshness before it's roasted, packed or shipped.",
  },
  {
    title: "Built for every buyer",
    detail:
      "From a single retail pack to recurring wholesale and export supply, our process scales without cutting corners.",
  },
];

export default function WhyItarIntakes() {
  return (
    <section className="bg-background-subtle py-14">
      <Container>
        <SectionHeading eyebrow="Why ItarIntakes" title="Trusted Makhana, at every scale" />
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {REASONS.map((reason) => (
            <div key={reason.title} className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm font-semibold text-foreground">{reason.title}</p>
              <p className="mt-2 text-sm text-foreground-muted">{reason.detail}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
