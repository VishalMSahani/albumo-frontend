import Link from "next/link";
import Image from "@/components/CdnImage";
import { cx } from "@/lib/cx";
import { ui } from "@/lib/ui";
import { homeUi } from "./home/home-ui";

export default function Gallery() {
  return (
    <section className="bg-surface py-16 sm:py-24" aria-labelledby="occasions-title">
      <div className={homeUi.container}>
        <div
          data-reveal
          className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"
        >
          <div>
            <span className={homeUi.eyebrow}>Made for your moments</span>
            <h2 id="occasions-title" className={homeUi.heading}>
              Big days. <span className="text-muted">Little joys.</span>
            </h2>
          </div>
          <Link href="/occasions" className={cx(ui.textLink, "shrink-0")}>
            Explore occasions <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-[1.15fr_1fr]">
          <Link
            data-reveal
            href="/occasions#travel"
            className="group relative isolate flex min-h-110 flex-col overflow-hidden rounded-[28px] bg-sand sm:min-h-140"
          >
            <Image
              src="/occasions/oc_travel.png"
              alt="A travel album filled with seaside holiday photographs"
              fill
              sizes="(max-width: 767px) 90vw, 55vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transform-none"
            />
            <div
              className={cx(
                homeUi.glass,
                "relative mx-4 mt-auto mb-4 flex items-center justify-between gap-4 rounded-2xl p-5 sm:mx-6 sm:mb-6 sm:p-6",
              )}
            >
              <div>
                <p className="mb-1 text-xs font-medium tracking-[0.12em] text-berry uppercase">
                  Travel
                </p>
                <h3 className="text-2xl leading-tight font-medium tracking-[-0.035em]">
                  Bring the adventure home.
                </h3>
              </div>
              <span
                aria-hidden="true"
                className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-white text-xl"
              >
                ↗
              </span>
            </div>
          </Link>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-1">
            <Link
              data-reveal
              data-reveal-delay="100"
              href="/occasions#wedding"
              className="group relative isolate flex min-h-64 items-end overflow-hidden rounded-[28px] border border-line/50 bg-rose p-7 sm:p-8"
            >
              <span
                aria-hidden="true"
                className="absolute -top-5 -right-5 grid size-56 place-items-center rounded-full border border-white/80 bg-white/30 text-berry/20 transition-transform duration-700 group-hover:rotate-12 motion-reduce:transform-none"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.7"
                  className="size-34"
                >
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
                </svg>
              </span>
              <div className="relative w-full">
                <p className="mb-3 text-xs font-medium tracking-[0.12em] text-berry uppercase">
                  Weddings & love
                </p>
                <h3 className="max-w-65 text-[32px] leading-[1.1] font-medium tracking-[-0.04em]">
                  The day.
                  <br />
                  The people. The yes.
                </h3>
                <span className="mt-5 flex items-center justify-between gap-4 text-sm">
                  Keep the whole story{" "}
                  <span aria-hidden="true" className="text-xl">
                    ↗
                  </span>
                </span>
              </div>
            </Link>
            <Link
              data-reveal
              data-reveal-delay="200"
              href="/occasions#everyday"
              className="group relative isolate flex min-h-64 items-end overflow-hidden rounded-[28px] border border-line/50 bg-sage p-7 sm:p-8"
            >
              <span
                aria-hidden="true"
                className="absolute -top-5 -right-5 grid size-56 place-items-center rounded-full border border-white/80 bg-white/30 text-ink/15 transition-transform duration-700 group-hover:rotate-45 motion-reduce:transform-none"
              >
                <svg
                  viewBox="0 0 100 100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-36"
                >
                  <circle cx="50" cy="50" r="23" />
                  <path d="M50 4v15m0 62v15M4 50h15m62 0h15M17 17l11 11m44 44 11 11M83 17 72 28M28 72 17 83" />
                </svg>
              </span>
              <div className="relative w-full">
                <p className="mb-3 text-xs font-medium tracking-[0.12em] text-muted uppercase">
                  Family & everyday
                </p>
                <h3 className="max-w-65 text-[32px] leading-[1.1] font-medium tracking-[-0.04em]">
                  No occasion
                  <br />
                  needed.
                </h3>
                <span className="mt-5 flex items-center justify-between gap-4 text-sm">
                  Celebrate the little things{" "}
                  <span aria-hidden="true" className="text-xl">
                    ↗
                  </span>
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
