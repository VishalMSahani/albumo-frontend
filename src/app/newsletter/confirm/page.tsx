import type { Metadata } from "next";
import NewsletterAction from "@/features/contact/NewsletterAction";
export const metadata: Metadata = {
  title: "Newsletter preferences",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default function Page() {
  return <NewsletterAction action="confirm" />;
}
