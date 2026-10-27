import KnowledgeArticle from "@/features/support/KnowledgeArticle";
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <KnowledgeArticle slug={slug} />;
}
