import Link from "next/link";
import { ui } from "@/lib/ui";
import { cx } from "@/lib/cx";
import { aboutUi } from "./about-ui";

export default function AboutCTA() {
  return (
    <section
      className={`${aboutUi.container} pb-16 sm:pb-24`}
      aria-labelledby="about-cta-title"
    >
      <div
        data-reveal
        className="relative isolate overflow-hidden rounded-[28px] border border-line/60 bg-rose px-6 py-14 text-center sm:rounded-[36px] sm:px-12 sm:py-20"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-36 -right-28 -z-10 size-100 rounded-full border border-white/80 bg-white/20 shadow-[inset_0_2px_30px_#ffffff90]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-28 -z-10 size-90 rounded-full border border-white/80 bg-white/30 shadow-[inset_0_2px_30px_#ffffff90]"
        />
        <h2 id="about-cta-title" className={`${aboutUi.heading} mx-auto max-w-150`}>
          Make something
          <br />
          <span className="text-berry">worth keeping.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-110 text-base text-muted sm:text-lg">
          Photo books, prints and gifts. Made personal.
        </p>
        <Link href="/products" className={cx(ui.button, "mt-8 rounded-full")}>
          Explore the collection <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}
