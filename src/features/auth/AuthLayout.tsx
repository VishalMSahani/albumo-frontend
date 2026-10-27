import Link from "next/link";
import type { ReactNode } from "react";
import { ui } from "@/lib/ui";

export default function AuthLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section data-reveal className={ui.container + " py-8 sm:py-14 lg:py-20"}>
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[28px] border border-line/80 bg-white shadow-[0_16px_50px_-36px_#3a2e2a35] md:grid-cols-[0.9fr_1fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-rose via-sand/50 to-sage p-10 md:flex lg:p-14">
          <div>
            <span className={ui.eyebrow}>Good times. Yours to keep.</span>
            <p className="mt-12 font-sans text-5xl leading-[1.08] font-medium tracking-[-0.05em]">
              A life full
              <br />
              of stories.
              <br />
              <em className="font-medium text-berry not-italic">A place for yours.</em>
            </p>
            <p className="mt-6 max-w-60 text-sm text-muted">
              From the big adventures to the little everyday things.
            </p>
          </div>
          <Link href="/products" className={ui.textLink + " mt-16 w-fit"}>
            Explore the collection
          </Link>
        </aside>
        <div className="px-6 py-9 sm:p-10 lg:p-14">
          <span className={ui.eyebrow + " text-muted"}>Your Albumo account</span>
          <h1 className="font-sans text-3xl leading-tight font-medium tracking-[-0.04em] sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
          )}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </section>
  );
}
