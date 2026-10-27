import Link from "next/link";
import { ui } from "@/lib/ui";
import { LEGAL_ENTITY, LEGAL_LAST_UPDATED } from "./constants";
import { legalNavigation, policies, type PolicyKey } from "./policies";
export default function PolicyPage({ policyKey }: { policyKey: PolicyKey }) {
  const policy = policies[policyKey];
  return (
    <section className={ui.container + " py-10 sm:py-16"}>
      <Link href="/" className="text-sm text-muted hover:underline">
        Home
      </Link>
      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[230px_1fr] lg:gap-16">
        <nav
          aria-label="Policies"
          className="flex flex-wrap gap-2 rounded-[24px] bg-surface p-3 lg:sticky lg:top-32 lg:grid"
        >
          {legalNavigation.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              aria-current={item.key === policyKey ? "page" : undefined}
              className="rounded-2xl px-4 py-3 text-sm text-muted transition-colors hover:bg-white aria-[current=page]:bg-white aria-[current=page]:font-semibold aria-[current=page]:text-berry aria-[current=page]:shadow-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <article className="max-w-3xl min-w-0">
          <span className={ui.eyebrow}>The details, clearly</span>
          <h1 className={ui.heading}>{policy.title}</h1>
          <p className="mt-5 text-muted">{policy.summary}</p>
          <p className="mt-6 border-b border-line pb-6 text-sm text-muted">
            {LEGAL_ENTITY} · Updated {LEGAL_LAST_UPDATED}
          </p>
          <div className="divide-y divide-line">
            {policy.sections.map((section, index) => (
              <section data-reveal key={section.title} className="py-7">
                <h2 className="flex gap-4 text-2xl font-medium tracking-tight">
                  <span className="pt-1 font-sans text-sm text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-7 text-muted">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <div className="mt-6 rounded-[28px] bg-rose/50 p-7">
            <h2 className="font-display text-2xl">A question about the details?</h2>
            <Link href="/contact" className={ui.textLink + " mt-3"}>
              Talk to Albumo
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
