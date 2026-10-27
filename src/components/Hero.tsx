import Link from "next/link";
import { ui } from "@/lib/ui";
import { cx } from "@/lib/cx";
import HomePosterGallery from "./home/HomePosterGallery";
import { homeUi } from "./home/home-ui";

export default function Hero() {
  return (
    <section
      className="relative pt-10 pb-10 sm:pt-14 sm:pb-14 lg:pt-16 lg:pb-18"
      aria-labelledby="home-title"
    >
      <div className={cx(homeUi.container, "relative text-center")}>
        <div className="relative z-10 mx-auto max-w-4xl">
          <span
            data-reveal
            className={cx(
              homeUi.glass,
              "mb-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-berry",
            )}
          >
            <span aria-hidden="true" className="size-1.5 rounded-full bg-berry" />
            Photo books & personal keepsakes
          </span>
          <h1
            id="home-title"
            data-reveal
            data-reveal-delay="100"
            className="font-sans text-[clamp(52px,6.3vw,88px)] leading-[1.04] font-medium tracking-[-0.06em]"
          >
            Good times.
            <br />
            <span className="text-berry">Yours to keep.</span>
          </h1>
          <p
            data-reveal
            data-reveal-delay="200"
            className="mx-auto mt-6 max-w-135 text-base leading-relaxed text-muted sm:text-lg"
          >
            Turn your travels, celebrations and everyday favourites into photo books,
            prints and gifts that feel like you.
          </p>
          <div
            data-reveal
            data-reveal-delay="300"
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
          >
            <Link href="/products" className={cx(ui.button, "rounded-full px-7")}>
              Find your keepsake <span aria-hidden="true">↗</span>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex min-h-12 items-center gap-3 rounded-full px-2 text-sm font-medium hover:text-berry"
            >
              How it works <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </div>
      <HomePosterGallery />
    </section>
  );
}
