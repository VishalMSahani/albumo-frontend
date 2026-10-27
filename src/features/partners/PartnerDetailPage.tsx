import Link from "next/link";
import { ui } from "@/lib/ui";
import { partnerCategories, type PartnerCategory } from "./partner-content";
import PartnerDirectory from "./PartnerDirectory";
import {
  PartnershipApplication,
  PartnershipQuestions,
  PartnershipSteps,
} from "./PartnerSections";

export default function PartnerDetailPage({ partner }: { partner: PartnerCategory }) {
  return (
    <div className="bg-white text-ink">
      <section className={ui.section}>
        <div className={ui.container}>
          <nav
            aria-label="Breadcrumb"
            className="mb-9 flex flex-wrap gap-2 text-sm text-muted"
          >
            <Link
              href="/partners"
              className="underline underline-offset-4 hover:text-berry"
            >
              Partner network
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{partner.title}</span>
          </nav>
          <div
            data-reveal
            className="grid items-end gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16"
          >
            <div>
              <span className={ui.eyebrow}>For {partner.title.toLowerCase()}</span>
              <h1 className={ui.display}>{partner.headline}</h1>
            </div>
            <div>
              <p className="text-lg leading-8 text-muted">{partner.description}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#apply" className={ui.buttonDark}>
                  Let’s partner
                </a>
                <a href="#discover" className={ui.buttonOutline}>
                  Discover partners
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 rounded-[32px] bg-linear-to-br from-rose via-sand/50 to-sage p-6 sm:mt-16 sm:p-10">
            <p className="text-xs font-semibold tracking-[0.12em] text-berry uppercase">
              Imagine it like this
            </p>
            <ol className="mt-7 grid gap-6 md:grid-cols-3 md:gap-10">
              {[
                ["The experience", partner.example.occasion],
                ["The keepsake", partner.example.keepsake],
                ["The next connection", partner.example.connection],
              ].map(([label, text], index) => (
                <li key={label} data-reveal className="border-t border-berry/20 pt-5">
                  <p className="text-sm text-muted">
                    0{index + 1} / {label}
                  </p>
                  <p className="mt-3 font-sans text-2xl leading-snug font-medium tracking-tight sm:text-3xl">
                    {text}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
      <section className="pb-14 sm:pb-20" aria-labelledby="partner-ideas">
        <div
          className={ui.container + " grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20"}
        >
          <div>
            <span className={ui.eyebrow}>Made around your business</span>
            <h2 id="partner-ideas" className={ui.heading}>
              Your experience.
              <br />
              <em>A new way to remember it.</em>
            </h2>
          </div>
          <ul className="divide-y divide-line border-y border-line">
            {partner.ideas.map((idea, index) => (
              <li key={idea} className="flex gap-5 py-6 text-lg leading-8">
                <span className="pt-1 text-sm text-berry">0{index + 1}</span>
                {idea}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <PartnershipSteps />
      <PartnerDirectory partnerType={partner.type} />
      <PartnershipApplication partnerType={partner.type} />
      <PartnershipQuestions />
      <nav aria-label="Other partnership types" className="border-t border-line py-10">
        <div className={ui.container}>
          <p className="text-sm font-medium">Explore other partnerships</p>
          <div className="mt-4 flex flex-wrap gap-x-7 gap-y-2">
            {partnerCategories
              .filter((item) => item.type !== partner.type)
              .map((item) => (
                <Link
                  key={item.slug}
                  href={"/partners/" + item.slug}
                  className="py-2 text-sm text-muted underline underline-offset-4 hover:text-berry"
                >
                  {item.title}
                </Link>
              ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
