import Hero from "@/components/Hero";
import ShopCategories from "@/components/ShopCategories";
import Products from "@/components/Products";
import HowItWorks from "@/components/HowItWorks";
import Gallery from "@/components/Gallery";
import WhyAlbumo from "@/components/WhyAlbumo";
import HomeFAQ from "@/components/home/HomeFAQ";
import HomeCTA from "@/components/home/HomeCTA";
import CustomerStories from "@/components/home/CustomerStories";
import AlbumJourney from "@/components/home/AlbumJourney";

export default function Home() {
  return (
    <>
      <Hero />
      <ShopCategories />
      <Products />
      <Gallery />
      <HowItWorks />
      <AlbumJourney />
      <CustomerStories />
      <WhyAlbumo />
      <HomeFAQ />
      <HomeCTA />
    </>
  );
}
