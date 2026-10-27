import Link from "next/link";
import { ui } from "@/lib/ui";
import { cx } from "@/lib/cx";
import { homeUi } from "./home-ui";

const questions = [
  {
    question: "How do I get started?",
    answer:
      "Browse the collection, choose a product and select your preferred options. Send an enquiry from the product page, and we'll help confirm the details before you order.",
  },
  {
    question: "Can you help me choose a photo book?",
    answer:
      "Of course. Tell us the occasion, how many photos you'd like to include and the style you have in mind. We can help you choose a suitable format and finish.",
  },
  {
    question: "Can I make a personalised gift?",
    answer:
      "Yes. Explore our photo books, prints and gifts for something that fits the person and the occasion. Available personalisation options are listed on each product page.",
  },
  {
    question: "When will my order arrive?",
    answer:
      "Production and delivery depend on your chosen product and location. We'll confirm the timing with you during your enquiry.",
  },
];

export default function HomeFAQ() {
  return (
    <section className="pb-16 sm:pb-24" aria-labelledby="faq-title">
      <div
        className={cx(
          homeUi.container,
          "grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-16 lg:gap-24",
        )}
      >
        <div data-reveal>
          <span className={homeUi.eyebrow}>A little help</span>
          <h2 id="faq-title" className={homeUi.heading}>
            Good questions.
            <br />
            <span className="text-muted">Simple answers.</span>
          </h2>
          <Link href="/help" className={cx(ui.textLink, "mt-6")}>
            Visit the help centre <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div data-reveal className="divide-y divide-line border-y border-line">
          {questions.map((item) => (
            <details key={item.question} className="group">
              <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-5 py-5 text-base font-medium tracking-[-0.02em] marker:content-none hover:text-berry sm:text-lg [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  aria-hidden="true"
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-surface text-xl text-berry transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none"
                >
                  +
                </span>
              </summary>
              <p className="max-w-145 pr-10 pb-6 text-base leading-relaxed text-muted">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
