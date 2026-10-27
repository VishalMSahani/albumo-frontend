import type { Metadata } from "next";
import AboutHero from "@/components/about/AboutHero";
import OurStory from "@/components/about/OurStory";
import OurFounder from "@/components/about/OurFounder";
import OurValues from "@/components/about/OurValues";
import OurProcess from "@/components/about/OurProcess";
import AboutCTA from "@/components/about/AboutCTA";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "We believe the best moments deserve more than a place in your camera roll. Meet Albumo: photo books and keepsakes for a life well lived.",
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <OurStory />
      <OurFounder />
      <OurValues />
      <OurProcess />
      <AboutCTA />
    </>
  );
}
