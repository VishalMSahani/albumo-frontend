import Link from "next/link";
import { ui } from "@/lib/ui";
import { aboutUi } from "./about-ui";

const steps = [
  {
    title: "Start with your favourites.",
    description:
      "The photographs you keep coming back to. The people, places and little details that tell your story.",
  },
  {
    title: "Find a format that feels like you.",
    description:
      "A book for a big adventure. An album for a milestone. A print that makes your everyday space more personal.",
  },
  {
    title: "Let’s bring it to life.",
    description:
      "Tell us what you have in mind. We’ll help you find the right paper, finish and format for your collection.",
  },
];

export default function OurProcess() {
  return (
    <section className={aboutUi.section} id="our-process" aria-labelledby="process-title">
      <div className={`${aboutUi.container} grid gap-12 md:grid-cols-2 lg:gap-24`}>
        <div data-reveal>
          <span className={aboutUi.eyebrow}>How it comes together</span>
          <h2 id="process-title" className={aboutUi.heading}>
            You bring the story.
            <br />
            <span className="text-berry">We bring the paper.</span>
          </h2>
          <Link href="/products" className={`${ui.textLink} mt-7`}>
            Meet the collection <span aria-hidden="true">↗</span>
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
              <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full border border-line bg-surface text-xs font-medium text-berry">
                0{index + 1}
              </span>
              <div>
                <h3 className="text-xl leading-tight font-medium tracking-[-0.025em]">
                  {step.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-muted">
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
