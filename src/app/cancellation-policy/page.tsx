import type { Metadata } from "next";
import PolicyPage from "@/features/legal/PolicyPage";
import { policies } from "@/features/legal/policies";
export const metadata: Metadata = {
  title: policies.cancellationPolicy.title,
  description: policies.cancellationPolicy.summary,
};
export default function Page() {
  return <PolicyPage policyKey="cancellationPolicy" />;
}
