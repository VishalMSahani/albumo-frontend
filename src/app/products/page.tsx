import type { Metadata } from "next";
import ProductsHero from "@/components/products/ProductsHero";
import ProductGrid from "@/components/products/ProductGrid";
import CTABanner from "@/components/CTABanner";
import { getCatalogue } from "@/lib/catalogue";
export const metadata: Metadata = {
  title: "The collection",
  description:
    "Explore Albumo photo albums, wall art and gifts. Choose your category, size, materials and personal touches.",
};
type Props = {
  searchParams: Promise<{ category?: string | string[]; q?: string | string[] }>;
};
export default async function ProductsPage({ searchParams }: Props) {
  const [catalogue, params] = await Promise.all([getCatalogue(), searchParams]);
  const category = typeof params.category === "string" ? params.category : "";
  const search = typeof params.q === "string" ? params.q : "";
  return (
    <>
      <ProductsHero />
      <ProductGrid
        key={category + search}
        {...catalogue}
        selectedCategory={category}
        initialSearch={search}
      />
      <CTABanner />
    </>
  );
}
