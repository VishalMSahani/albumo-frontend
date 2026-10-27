import Link from "next/link";
import { ui } from "@/lib/ui";
import { cx } from "@/lib/cx";
import { homeUi } from "./home/home-ui";

const steps = [
  {
    title: "Find your format.",
    description:
      "Choose a photo book, print or gift, then explore the sizes and finishes.",
  },
  {
    title: "Make it personal.",
    description: "Pick your favourite photos and tell us the story you want to create.",
  },
  {
    title: "Leave the details to us.",
    description:
      "Send an enquiry. We'll help with the options and confirm your price and delivery.",
  },
];
export default function HowItWorks() {
  return (
    <section className={homeUi.section} id="how-it-works" aria-labelledby="steps-title">
      <div className={cx(homeUi.container, "grid gap-12 md:grid-cols-2 lg:gap-24")}>
        <div data-reveal>
          <span className={homeUi.eyebrow}>How it works</span>
          <h2 id="steps-title" className={homeUi.heading}>
            From camera roll
            <br />
            <span className="text-berry">to coffee table.</span>
          </h2>
          <p className="mt-6 max-w-95 text-base text-muted sm:text-lg">
            You bring the memories.
            <br />
            We’ll help you find their home.
          </p>
          <Link href="/contact" className={cx(ui.textLink, "mt-6")}>
            Need a hand? Talk to us <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <ol className="divide-y divide-line border-y border-line">
          {steps.map((step, index) => (
            <li
              data-reveal
              data-reveal-delay={index * 120}
              key={step.title}
              className="flex gap-5 py-7 sm:gap-6 sm:py-8"
            >
              <span
                aria-hidden="true"
                className="mt-0.5 grid size-11 shrink-0 place-items-center rounded-full border border-line bg-surface text-sm text-berry"
              >
                0{index + 1}
              </span>
              <div>
                <h3 className="text-xl font-medium tracking-[-0.025em]">{step.title}</h3>
                <p className="mt-3 max-w-100 text-base leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
