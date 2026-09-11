import type { Metadata } from "next";
import PolicyPage from "@/components/policies/PolicyPage";
import { policies } from "@/lib/policies";

export const metadata: Metadata = { title: "Cancellation & Refunds" };

export default function RefundsPage() {
  return <PolicyPage policy={policies.refunds} />;
}
