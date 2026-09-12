import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import EnquiryForm, { type EnquiryFieldConfig } from "@/components/forms/EnquiryForm";

export const metadata: Metadata = {
  title: "Export",
  description:
    "Submit an export enquiry for bulk or private-label Makhana supply, with packaging and documentation support.",
};

const FIELDS: EnquiryFieldConfig[] = [
  { name: "contactName", label: "Contact name", required: true },
  { name: "company", label: "Company name", required: true },
  { name: "country", label: "Country", required: true },
  { name: "mobile", label: "Mobile / WhatsApp number", type: "tel", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "quantity", label: "Expected quantity" },
  { name: "packaging", label: "Pack sizes / private-label requirement" },
  { name: "destination", label: "Destination port / city" },
  {
    name: "requirement",
    label: "Documentation or other requirements",
    type: "textarea",
    span2: true,
  },
];

export default function ExportPage() {
  return (
    <Container className="py-12">
      <SectionHeading
        eyebrow="Export"
        title="Export enquiry"
        description="For international buyers seeking bulk supply or private-label packaging. Our team will follow up with documentation and export details."
      />
      <div className="mt-8 max-w-2xl">
        <EnquiryForm type="export" fields={FIELDS} submitLabel="Submit export enquiry" />
      </div>
    </Container>
  );
}
