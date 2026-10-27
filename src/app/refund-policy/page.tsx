import type { Metadata } from "next";
import PolicyPage from "@/features/legal/PolicyPage";
import { policies } from "@/features/legal/policies";
export const metadata: Metadata = {
  title: policies.refundPolicy.title,
  description: policies.refundPolicy.summary,
};
export default function Page() {
  return <PolicyPage policyKey="refundPolicy" />;
}
