import type { Metadata } from "next";
import PageIntro from "@/components/PageIntro";
import NewsletterForm from "@/features/contact/NewsletterForm";
import { ui } from "@/lib/ui";
export const metadata: Metadata = { title: "Letters from Albumo" };
export default function Page() {
  return (
    <>
      <PageIntro
        page="Newsletter"
        eyebrow="Letters from Albumo"
        description="A little inspiration for your next adventure, and lovely ways to remember the last one."
      >
        Worth <em>keeping.</em>
      </PageIntro>
      <section className={ui.container + " pb-20"}>
        <div className="max-w-lg rounded-[28px] border border-line/80 bg-white p-6 shadow-[0_16px_50px_-36px_#3a2e2a35] sm:p-9">
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
