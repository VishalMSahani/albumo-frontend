import Link from "next/link";
import { ui } from "@/lib/ui";
export default function CTABanner() {
  return (
    <section className="py-12 sm:py-20">
      <div className={ui.container}>
        <div
          data-reveal
          className="relative flex flex-col items-start justify-between gap-8 overflow-hidden rounded-[32px] bg-berry px-7 py-12 text-white sm:p-12 md:flex-row md:items-center lg:p-16"
        >
          <div className="max-w-2xl">
            <span className="mb-5 block text-xs font-semibold tracking-[0.14em] text-white/80 uppercase">
              Start with a favourite memory
            </span>
            <h2 className="text-[clamp(32px,4vw,54px)] leading-[1.1] font-medium tracking-[-0.045em] text-balance">
              Make something worth keeping.
            </h2>
            <p className="mt-5 max-w-md text-base text-white/85">
              Photo books, prints and gifts. Personal from the very first page.
            </p>
          </div>
          <Link href="/products" className={ui.buttonOutline + " shrink-0"}>
            Explore the collection <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
