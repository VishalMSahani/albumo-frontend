import type { Metadata } from "next";
import OccasionsHero from "@/components/occasions/OccasionsHero";
import OccasionGrid from "@/components/occasions/OccasionGrid";
import OccasionShowcase from "@/components/occasions/OccasionShowcase";
import CTABanner from "@/components/CTABanner";

export const metadata: Metadata = {
  title: "For every occasion",
  description:
    "Keep your travels, wedding day, family moments and celebrations close with a personal Albumo photo book.",
};

export default function OccasionsPage() {
  return (
    <>
      <OccasionsHero />
      <OccasionGrid />
      <OccasionShowcase />
      <CTABanner />
    </>
  );
}
