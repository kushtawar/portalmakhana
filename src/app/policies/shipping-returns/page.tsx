import type { Metadata } from "next";
import PolicyPage from "@/components/policies/PolicyPage";
import { policies } from "@/lib/policies";

export const metadata: Metadata = { title: "Shipping & Returns" };

export default function ShippingReturnsPage() {
  return <PolicyPage policy={policies["shipping-returns"]} />;
}
