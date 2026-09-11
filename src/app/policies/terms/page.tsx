import type { Metadata } from "next";
import PolicyPage from "@/components/policies/PolicyPage";
import { policies } from "@/lib/policies";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return <PolicyPage policy={policies.terms} />;
}
