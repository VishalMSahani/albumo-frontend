import Link from "next/link";
import { ui } from "@/lib/ui";
import { partnerCategories } from "./partner-content";
import PartnerDirectory from "./PartnerDirectory";
import {
  PartnershipApplication,
  PartnershipQuestions,
  PartnershipSteps,
} from "./PartnerSections";

export default function PartnersPage() {
  return (
    <div className="bg-white text-ink">
      <section className={ui.section}>
        <div
          className={
            ui.container +
            " grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20"
          }
        >
          <div data-reveal>
            <span className={ui.eyebrow}>The Albumo partner network</span>
            <h1 className={ui.display}>
              Great experiences.
              <br />
              <em>Lasting connections.</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
              You create the moments. We help turn them into keepsakes. Together, we help
              more people discover what comes next.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#apply" className={ui.buttonDark}>
                Become a partner
              </a>
              <a href="#discover" className={ui.buttonOutline}>
                Explore the network
              </a>
            </div>
            <p className="mt-5 text-sm leading-6 text-muted">
              For travel agencies, photographers and businesses that bring people
              together.
            </p>
          </div>
          <div
            data-reveal
            data-reveal-delay="120"
            className="rounded-[32px] border border-white bg-linear-to-br from-rose via-sand/50 to-sage px-7 pt-12 pb-8 sm:px-10"
          >
            <p className="text-xs font-semibold tracking-[0.15em] text-berry uppercase">
              Good things come full circle
            </p>
            <ol className="mt-8 divide-y divide-berry/15">
              {[
                ["01", "An experience.", "Your trip, your shoot, your celebration."],
                ["02", "A keepsake.", "Their favourite moments, printed with Albumo."],
                ["03", "A new connection.", "Your business, discovered by someone new."],
              ].map(([number, title, text]) => (
                <li key={number} className="flex gap-5 py-6">
                  <span className="pt-2 text-xs text-berry">{number}</span>
                  <div>
                    <p className="font-sans text-3xl font-medium tracking-[-0.04em] sm:text-4xl">
                      {title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section
        className="border-y border-line bg-surface/40 py-12 sm:py-16"
        aria-labelledby="two-way-title"
      >
        <div className={ui.container}>
          <span className={ui.eyebrow}>A partnership that works both ways</span>
          <h2 id="two-way-title" className={ui.heading}>
            Something for your customers.
            <br />
            <em>Someone new for your business.</em>
          </h2>
          <div className="mt-9 grid gap-8 md:grid-cols-2 md:gap-20">
            <div>
              <h3 className="text-xl font-medium">Bring Albumo into your experience</h3>
              <p className="mt-3 max-w-lg text-base leading-7 text-muted">
                Include a photo album in a trip, a shoot or a celebration. Give your
                customers a reason to revisit the experience you created.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium">Find your place in our community</h3>
              <p className="mt-3 max-w-lg text-base leading-7 text-muted">
                An optional directory profile helps Albumo visitors discover your business
                and connect with you for their next adventure or milestone.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={ui.section} aria-labelledby="partner-types">
        <div className={ui.container}>
          <span className={ui.eyebrow}>Find your fit</span>
          <h2 id="partner-types" className={ui.heading}>
            Different worlds. A shared love of memories.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {partnerCategories.map((category, index) => (
              <Link
                key={category.slug}
                href={"/partners/" + category.slug}
                data-reveal
                className="group flex gap-5 rounded-[28px] border border-line/70 bg-surface p-7 transition-colors hover:border-berry/30 hover:bg-rose/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-berry"
              >
                <span className="pt-1.5 text-xs text-muted">0{index + 1}</span>
                <div>
                  <h3 className="font-sans text-2xl font-medium tracking-tight transition-colors group-hover:text-berry motion-reduce:transition-none sm:text-3xl">
                    {category.title}
                  </h3>
                  <p className="mt-2 max-w-md text-base leading-7 text-muted">
                    {category.shortDescription}
                  </p>
                  <span className="mt-4 inline-block text-sm font-medium underline decoration-line underline-offset-4 group-hover:decoration-berry">
                    Explore the partnership
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <PartnershipSteps />
      <PartnerDirectory />
      <PartnershipApplication />
      <PartnershipQuestions />
    </div>
  );
}
