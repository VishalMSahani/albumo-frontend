"use client";
import { Button } from "@/components/base/buttons/button";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import PageIntro from "@/components/PageIntro";
import { Field, FormNotice } from "@/components/forms/FormUI";
import { useResource } from "@/lib/use-resource";
import { ui } from "@/lib/ui";
import { supportApi } from "./support.service";
import { knowledgeCategories } from "./constants";

export default function HelpCenter() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const articles = useResource("help:" + search + ":" + category, () =>
    supportApi.getArticles(search, category),
  );
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(String(new FormData(event.currentTarget).get("search") || "").trim());
  }
  return (
    <>
      <PageIntro
        page="Help centre"
        eyebrow="A little guidance"
        description="From choosing your first album to checking a delivery. Find an answer, or start a conversation with us."
      >
        Here to <em>help.</em>
      </PageIntro>
      <section className={ui.container + " pb-16 sm:pb-24"}>
        <div className="grid gap-10 lg:grid-cols-[1fr_280px] lg:gap-16">
          <div>
            <form
              onSubmit={submit}
              className="grid gap-3 rounded-[28px] border border-line/60 bg-surface p-5 sm:grid-cols-[1fr_auto] sm:items-end sm:p-6"
            >
              <Field
                label="What can we help with?"
                name="search"
                type="search"
                maxLength={200}
                placeholder="Search articles"
              />
              <Button type="submit" color="dark">
                Search
              </Button>
            </form>
            <div className="my-6 flex flex-wrap gap-2" aria-label="Article categories">
              {[{ value: "", label: "All topics" }, ...knowledgeCategories].map(
                (item) => (
                  <button
                    key={item.value}
                    onClick={() => setCategory(item.value)}
                    aria-pressed={category === item.value}
                    className="min-h-10 rounded-full border border-line px-4 py-2 text-sm aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper"
                  >
                    {item.label}
                  </button>
                ),
              )}
            </div>
            {articles.loading && (
              <p role="status" className="py-8 text-sm text-muted">
                Finding your answers...
              </p>
            )}
            {articles.error && (
              <div className="space-y-4">
                <FormNotice error>{articles.error}</FormNotice>
                <button onClick={articles.reload} className="min-h-11 text-sm underline">
                  Try again
                </button>
              </div>
            )}
            {articles.data?.length === 0 && (
              <div className="border-y border-line py-10">
                <h2 className="font-sans text-2xl font-medium tracking-tight">
                  Let’s find it together.
                </h2>
                <p className="mt-3 text-sm text-muted">
                  No articles match just yet. Try another search or send us your question.
                </p>
                <Link href="/support/new" className={ui.textLink + " mt-4"}>
                  Ask Albumo
                </Link>
              </div>
            )}
            <div className="grid gap-4">
              {articles.data?.map((article) => (
                <Link
                  href={"/help/" + encodeURIComponent(article.slug)}
                  key={article.id}
                  className="group block rounded-[24px] border border-line/80 bg-white p-6 transition-colors hover:border-berry/40 hover:bg-rose/20"
                >
                  <p className="mb-2 text-sm tracking-wider text-muted uppercase">
                    {knowledgeCategories.find((item) => item.value === article.category)
                      ?.label || "Help"}
                  </p>
                  <h2 className="font-sans text-2xl font-medium tracking-tight hover:text-berry">
                    {article.title}
                  </h2>
                  <p className="mt-2 text-sm text-muted">{article.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
          <aside
            data-reveal
            className="space-y-6 self-start border-t border-line pt-6 lg:border-t-0 lg:pt-0"
          >
            <div className="rounded-[28px] bg-linear-to-br from-rose to-sand/50 p-7">
              <h2 className="font-sans text-2xl font-medium tracking-tight">
                A human can help.
              </h2>
              <p className="my-4 text-sm text-muted">
                Tell us what happened. We’ll keep your request and our replies in one
                place.
              </p>
              <Link href="/support/new" className={ui.textLink}>
                Start a request
              </Link>
            </div>
            <Link href="/support/tickets" className={ui.textLink}>
              Follow a conversation
            </Link>
            <p className="text-sm leading-6 text-muted">
              Have an event, group trip, or something special in mind?{" "}
              <Link href="/contact?intent=custom" className="underline">
                Let’s talk.
              </Link>
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
