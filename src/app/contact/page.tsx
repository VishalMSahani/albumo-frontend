import type { Metadata } from "next";
import { Suspense } from "react";
import ContactPage from "@/features/contact/ContactPage";
export const metadata: Metadata = {
  title: "Contact",
  description: "Questions, group trips, or events. Start a conversation with Albumo.",
};
export default function Page() {
  return (
    <Suspense fallback={<p className="p-12">Loading...</p>}>
      <ContactPage />
    </Suspense>
  );
}
