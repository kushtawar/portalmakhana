import type { Metadata } from "next";
import PolicyPage from "@/components/policies/PolicyPage";
import { policies } from "@/lib/policies";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return <PolicyPage policy={policies.privacy} />;
}
