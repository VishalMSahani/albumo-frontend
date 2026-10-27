import type { Metadata } from "next";
import PartnersPage from "@/features/partners/PartnersPage";

export const metadata: Metadata = {
  title: "The Albumo partner network",
  description:
    "Create lasting memories with Albumo. Explore partnerships for travel agencies, photographers and creative businesses, or discover your next partner.",
};

export default function Page() {
  return <PartnersPage />;
}
