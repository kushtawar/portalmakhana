import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import EnquiryForm, { type EnquiryFieldConfig } from "@/components/forms/EnquiryForm";

export const metadata: Metadata = {
  title: "Wholesale Order",
  description:
    "Submit a wholesale or distribution enquiry for recurring Makhana supply, commercial terms and territory support.",
};

const FIELDS: EnquiryFieldConfig[] = [
  { name: "contactName", label: "Contact name", required: true },
  { name: "company", label: "Company / business name", required: true },
  { name: "mobile", label: "Mobile number", type: "tel", required: true },
  { name: "email", label: "Email", type: "email" },
  { name: "destination", label: "City / state" },
  { name: "grade", label: "Preferred grade" },
  { name: "packSizes", label: "Desired pack sizes" },
  { name: "quantity", label: "Expected quantity" },
  { name: "frequency", label: "Order frequency (one-time / recurring)" },
  {
    name: "requirement",
    label: "Anything else we should know?",
    type: "textarea",
    span2: true,
  },
];

export default function WholesalePage() {
  return (
    <Container className="py-12">
      <SectionHeading
        eyebrow="Wholesale & Distribution"
        title="Tell us about your requirement"
        description="For distributors, retailers and recurring bulk buyers. Our team will respond with commercial terms and next steps."
      />
      <div className="mt-8 max-w-2xl">
        <EnquiryForm type="wholesale" fields={FIELDS} submitLabel="Submit wholesale enquiry" />
      </div>
    </Container>
  );
}
