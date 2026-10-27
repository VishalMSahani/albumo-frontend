import Link from "next/link";
import { ui } from "@/lib/ui";
import { cx } from "@/lib/cx";
import { homeUi } from "./home/home-ui";

export default function WhyAlbumo() {
  return (
    <section
      className={cx(homeUi.container, "pb-16 sm:pb-24")}
      aria-labelledby="why-title"
    >
      <div className="relative isolate overflow-hidden rounded-[32px] bg-berry px-6 py-16 text-center text-white sm:rounded-[40px] sm:px-12 sm:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 -right-24 -z-10 size-100 rounded-full border border-white/15 bg-white/5"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-20 -z-10 size-100 rounded-full border border-white/15 bg-white/5"
        />
        <div data-reveal>
          <span className="mb-7 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-medium tracking-wider">
            THE ALBUMO WAY
          </span>
          <h2
            id="why-title"
            className="mx-auto max-w-230 text-[clamp(38px,5vw,68px)] leading-[1.1] font-medium tracking-[-0.05em] text-balance"
          >
            A little less scrolling.
            <br />
            <span className="text-white/75">A little more remembering.</span>
          </h2>
          <p className="mx-auto mt-7 max-w-130 text-base leading-relaxed text-white/85 sm:text-lg">
            Your favourite moments deserve a place in everyday life. On a shelf. On a
            wall. In the hands of someone you love.
          </p>
          <Link
            href="/about"
            className={cx(
              ui.buttonOutline,
              "mt-8 rounded-full border-white bg-white px-7 text-berry hover:border-white hover:bg-rose hover:text-berry",
            )}
          >
            Get to know Albumo <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
