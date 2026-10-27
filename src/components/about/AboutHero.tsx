import Link from "next/link";
import Image from "@/components/CdnImage";
import { ui } from "@/lib/ui";
import { cx } from "@/lib/cx";
import { aboutUi } from "./about-ui";

export default function AboutHero() {
  return (
    <section
      className="relative pt-12 pb-4 sm:pt-20 lg:pt-24"
      aria-labelledby="about-title"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-8 left-1/2 h-120 w-[min(850px,100%)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,var(--color-rose),transparent_70%)]"
      />
      <div className={`${aboutUi.container} relative`}>
        <div className="mx-auto max-w-4xl text-center">
          <span
            data-reveal
            className={`${aboutUi.glass} mb-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-berry`}
          >
            <span className="size-1.5 rounded-full bg-berry" aria-hidden="true" /> About
            Albumo
          </span>
          <h1
            data-reveal
            data-reveal-delay="100"
            id="about-title"
            className="font-sans text-[clamp(44px,6.4vw,88px)] leading-[1.05] font-medium tracking-[-0.06em] text-balance"
          >
            Some things deserve
            <br />
            <span className="text-berry">to be held.</span>
          </h1>
          <p
            data-reveal
            data-reveal-delay="200"
            className="mx-auto mt-7 max-w-135 text-base leading-relaxed text-muted sm:text-lg"
          >
            Your favourite moments, turned into photo books and keepsakes.
          </p>
          <div
            data-reveal
            data-reveal-delay="300"
            className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3"
          >
            <Link href="/products" className={cx(ui.button, "rounded-full")}>
              Find your photo book <span aria-hidden="true">↗</span>
            </Link>
            <a
              href="#our-story"
              className="inline-flex min-h-12 items-center gap-3 rounded-full px-3 text-sm font-medium transition-colors hover:text-berry motion-reduce:transition-none"
            >
              Get to know us <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
        <div
          data-reveal
          className="relative mt-14 grid overflow-hidden rounded-[28px] border border-line/60 bg-sand sm:mt-18 sm:rounded-[36px] md:min-h-120 md:grid-cols-[0.85fr_1.15fr]"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,var(--color-rose),transparent_70%)]"
          />
          <div className="relative z-10 flex flex-col items-start justify-center px-7 pt-9 pb-4 sm:px-12 md:py-12">
            <p className="max-w-90 text-[clamp(32px,3.7vw,48px)] leading-[1.15] font-medium tracking-[-0.045em]">
              Your memories.
              <br />
              <span className="text-berry">Made real.</span>
            </p>
            <p className="mt-5 max-w-70 text-base text-muted">
              From your camera roll to your coffee table.
            </p>
          </div>
          <div className="relative mx-auto flex w-full max-w-140 items-center justify-center px-5 pt-3 pb-5 md:py-6 md:pr-9">
            <Image
              src="/hero1.png"
              alt="A printed travel photo book, an open album of holiday memories, and the photographs on a phone"
              width={1060}
              height={1063}
              sizes="(max-width: 767px) 90vw, 550px"
              className="h-auto w-full max-w-110 object-contain drop-shadow-[0_16px_20px_#3a2e2a12]"
              preload
            />
          </div>
        </div>
      </div>
    </section>
  );
}
