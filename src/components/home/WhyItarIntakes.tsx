import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";

const REASONS = [
  {
    title: "Quality selection",
    detail:
      "Silver, Gold and Diamond Makhana — each grade carefully selected, so you know exactly what you're buying.",
  },
  {
    title: "Handpicked option",
    detail:
      "Besides regular machine-prepared packs, Gold and Diamond come in a Handpicked option — manually filtered and selected before packing.",
  },
  {
    title: "Hygienic packaging",
    detail:
      "Consistency and customer trust come first: every Shrestha product is hygienically packed for everyday use.",
  },
];

export default function WhyItarIntakes() {
  return (
    <section className="bg-background-subtle py-14">
      <Container>
        <SectionHeading eyebrow="Why Shrestha" title="Quality, careful selection and hygienic packaging" />
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
