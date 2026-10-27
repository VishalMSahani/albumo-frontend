import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PartnerDetailPage from "@/features/partners/PartnerDetailPage";
import { partnerCategories } from "@/features/partners/partner-content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return partnerCategories.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const partner = partnerCategories.find((item) => item.slug === slug);
  if (!partner) return { title: "Partner network" };
  return { title: partner.title + " partnerships", description: partner.description };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const partner = partnerCategories.find((item) => item.slug === slug);
  if (!partner) notFound();
  return <PartnerDetailPage partner={partner} />;
}
