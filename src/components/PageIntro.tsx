import Link from "next/link";
import type { ReactNode } from "react";
import { ui } from "@/lib/ui";
type Props = { page: string; eyebrow: string; children: ReactNode; description: string };
export default function PageIntro({ page, eyebrow, children, description }: Props) {
  return (
    <section className="pt-6 pb-10 sm:pb-14">
      <div className={ui.container}>
        <nav
          className="mb-8 flex flex-wrap items-center gap-3 text-sm text-muted sm:mb-10 [&_a:hover]:text-berry"
          aria-label="Breadcrumb"
        >
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{page}</span>
        </nav>
        <div
          data-reveal
          className="relative grid items-end gap-6 overflow-hidden rounded-[32px] border border-white bg-linear-to-br from-rose via-surface to-sand/60 px-6 py-10 sm:px-10 sm:py-14 md:grid-cols-[1.2fr_1fr] md:gap-12 lg:px-14 lg:py-16"
        >
          <div>
            <span className={ui.eyebrow}>{eyebrow}</span>
            <h1 className={ui.display}>{children}</h1>
          </div>
          <p className="max-w-lg text-base leading-relaxed text-muted md:pb-1">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
