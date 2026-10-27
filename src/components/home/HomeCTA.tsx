import Image from "@/components/CdnImage";
import Link from "next/link";
import { ui } from "@/lib/ui";
import { cx } from "@/lib/cx";
import { homeUi } from "./home-ui";

export default function HomeCTA() {
  return (
    <section
      className="overflow-hidden border-t border-berry/10 bg-rose py-14 sm:py-18 lg:py-20"
      aria-labelledby="home-cta-title"
    >
      <div
        className={cx(
          homeUi.container,
          "grid items-center gap-7 md:grid-cols-2 md:gap-14 lg:gap-16",
        )}
      >
        <div data-reveal className="text-center md:text-left">
          <h2 id="home-cta-title" className={homeUi.heading}>
            Your next chapter.
            <br />
            <span className="text-berry">Made to keep.</span>
          </h2>
          <p className="mt-5 text-base text-muted sm:text-lg">
            Start with a photo you love.
          </p>
          <Link
            href="/products"
            className={cx(ui.buttonDark, "mt-7 hidden px-8 md:inline-flex")}
          >
            Explore the collection <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div
          data-reveal
          data-reveal-delay="120"
          className="relative mx-auto w-full max-w-[280px] sm:max-w-sm lg:max-w-lg"
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-3 top-8 bottom-8 rounded-[48%] border border-white bg-white/60"
          />
          <Image
            src="/hero1.png"
            alt="A printed travel photo book, an open album of holiday memories, and the photographs on a phone"
            width={1060}
            height={1063}
            sizes="(max-width: 639px) 280px, (max-width: 767px) 384px, (max-width: 1023px) 50vw, 512px"
            className="relative h-auto w-full drop-shadow-[0_24px_24px_#3a2e2a14]"
          />
        </div>
        <div data-reveal className="text-center md:hidden">
          <Link href="/products" className={cx(ui.buttonDark, "px-8")}>
            Explore the collection <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
