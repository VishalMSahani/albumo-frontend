"use client";
import Link from "next/link";
import { FormNotice } from "@/components/forms/FormUI";
import { useResource } from "@/lib/use-resource";
import { ui } from "@/lib/ui";
import { supportApi } from "./support.service";
export default function KnowledgeArticle({ slug }: { slug: string }) {
  const article = useResource("article:" + slug, () => supportApi.getArticle(slug));
  return (
    <section className={ui.container + " py-12 sm:py-20"}>
      <div className="mx-auto max-w-3xl rounded-[28px] border border-line/70 bg-white p-6 shadow-[0_16px_50px_-36px_#3a2e2a35] sm:p-12">
        <Link href="/help" className="text-sm underline">
          Back to help centre
        </Link>
        {article.loading && (
          <p role="status" className="mt-10">
            Loading your answer...
          </p>
        )}
        {article.error && (
          <div className="mt-10 space-y-4">
            <h1 className="font-display text-3xl">We couldn’t open this article.</h1>
            <FormNotice error>{article.error}</FormNotice>
            <button onClick={article.reload} className="min-h-11 underline">
              Try again
            </button>
          </div>
        )}
        {article.data && (
          <article data-reveal className="mt-10">
            <h1 className={ui.heading}>{article.data.title}</h1>
            <p className="mt-5 text-muted">{article.data.excerpt}</p>
            <div className="mt-8 space-y-5 border-t border-line pt-8 text-sm leading-7">
              {article.data.content.split(/\n{2,}/).map((paragraph, index) => (
                <p key={index} className="break-words whitespace-pre-line">
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        )}
        <div className="mt-12 border-t border-line pt-8">
          <h2 className="font-sans text-2xl font-medium tracking-tight">
            Need a little more help?
          </h2>
          <Link href="/support/new" className={ui.textLink + " mt-4"}>
            Start a conversation
          </Link>
        </div>
      </div>
    </section>
  );
}
