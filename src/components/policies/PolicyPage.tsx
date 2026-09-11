import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import type { PolicyContent } from "@/lib/policies";

export default function PolicyPage({ policy }: { policy: PolicyContent }) {
  return (
    <Container className="max-w-3xl py-12">
      <SectionHeading title={policy.title} description={policy.summary} />
      <div className="mt-8 space-y-6">
        {policy.sections.map((section) => (
          <div key={section.heading}>
            <h2 className="text-sm font-semibold text-foreground">{section.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
              {section.body}
            </p>
          </div>
        ))}
      </div>
    </Container>
  );
}
