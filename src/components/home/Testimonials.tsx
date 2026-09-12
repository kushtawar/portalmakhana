import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";

// Placeholder testimonials pending real, approved customer quotes.
const TESTIMONIALS = [
  {
    name: "Ananya Sharma",
    location: "Delhi",
    quote:
      "The roasted Makhana is so fresh and crunchy — it's become our go-to evening snack at home.",
  },
  {
    name: "Rohit Verma",
    location: "Bengaluru",
    quote:
      "Ordered a bulk pack for a family function and the quality was consistent across every packet.",
  },
  {
    name: "Priya Nair",
    location: "Kochi",
    quote:
      "Finally found Makhana that doesn't taste stale by the time it reaches me down south. Great packaging too.",
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5 text-accent">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg key={index} viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
          <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6L10 14.6l-5.4 3.2 1.3-6-4.6-4.1 6.1-.6L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-14">
      <Container>
        <SectionHeading
          eyebrow="Customer Stories"
          title="What our customers say"
          align="center"
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <div key={testimonial.name} className="rounded-xl border border-border bg-card p-6">
              <Stars />
              <p className="mt-3 text-sm text-foreground-muted">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <p className="mt-4 text-sm font-semibold text-foreground">{testimonial.name}</p>
              <p className="text-xs text-foreground-muted">{testimonial.location}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
