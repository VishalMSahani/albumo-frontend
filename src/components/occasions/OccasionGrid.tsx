import Image from "@/components/CdnImage";
import Link from "next/link";
import { ui } from "@/lib/ui";

const occasions = [
  {
    id: "travel",
    number: "01",
    label: "The places you go",
    title: "Bring the adventure home.",
    description:
      "The wrong turns, the new favourites, the view you still think about. Give your travels a home beyond your camera roll.",
    href: "/products?q=travel",
    action: "Explore travel books",
    tone: "bg-sage",
  },
  {
    id: "wedding",
    number: "02",
    label: "The people you love",
    title: "One day. Every feeling.",
    description:
      "The quiet before. The loudest yes. Every face that made the day yours, together in one beautiful keepsake.",
    href: "/products?q=wedding",
    action: "Explore wedding albums",
    tone: "bg-rose",
  },
  {
    id: "everyday",
    number: "03",
    label: "The little things",
    title: "Ordinary days. Wonderful stories.",
    description:
      "First steps, slow Sundays and the people who feel like home. You don't need a special occasion to make a keepsake.",
    href: "/products",
    action: "Find your keepsake",
    tone: "bg-sand",
  },
];

export default function OccasionGrid() {
  return (
    <section className="pb-14 sm:pb-20" aria-label="Find your occasion">
      <div className={ui.container + " grid gap-6"}>
        {occasions.map((occasion) => (
          <article
            key={occasion.id}
            id={occasion.id}
            className={
              "grid scroll-mt-32 overflow-hidden rounded-[32px] md:grid-cols-2 " +
              occasion.tone
            }
          >
            <div
              data-reveal
              className="relative grid min-h-72 place-items-center overflow-hidden p-8 sm:min-h-96 md:min-h-[460px]"
            >
              {occasion.id === "travel" ? (
                <Image
                  src="/occasions/oc_travel.png"
                  alt="Travel photo book with a seaside holiday photograph"
                  width={600}
                  height={600}
                  sizes="(max-width: 767px) 90vw, 45vw"
                  className="h-auto w-full max-w-md rounded-[24px]"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="relative flex aspect-[1.15] w-full max-w-xs items-center justify-center"
                >
                  <div className="absolute inset-3 rotate-[-8deg] rounded-[20px] border border-white/90 bg-white/35" />
                  <div
                    className={
                      ui.glass +
                      " relative flex h-full w-full rotate-[5deg] flex-col items-center justify-center gap-5 p-8"
                    }
                  >
                    {occasion.id === "wedding" ? (
                      <svg
                        viewBox="0 0 100 100"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="size-28 text-berry"
                      >
                        <path d="M50 79 18 49C-5 22 32 5 50 31 68 5 105 22 82 49Z" />
                        <path d="M24 61C36 72 64 72 76 61" strokeDasharray="2 5" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 100 100"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="size-28 text-terracotta"
                      >
                        <circle cx="50" cy="50" r="23" />
                        <path d="M50 8v10m0 64v10M8 50h10m64 0h10M20 20l7 7m46 46 7 7m0-60-7 7M27 73l-7 7M40 53q10 12 20 0" />
                      </svg>
                    )}
                    <span className="text-xs font-medium tracking-[0.18em] uppercase">
                      {occasion.id === "wedding"
                        ? "Our favourite day"
                        : "These are the days"}
                    </span>
                  </div>
                </div>
              )}
              <span className="absolute top-6 left-6 rounded-full bg-white/80 px-4 py-2 text-xs font-medium backdrop-blur-md">
                {occasion.number} / Stories to keep
              </span>
            </div>
            <div
              data-reveal
              data-reveal-delay="120"
              className="flex flex-col items-start justify-center px-7 pt-2 pb-10 sm:p-10 lg:p-14"
            >
              <span className={ui.eyebrow}>{occasion.label}</span>
              <h2 className={ui.heading}>{occasion.title}</h2>
              <p className="mt-5 max-w-md text-base leading-7 text-muted">
                {occasion.description}
              </p>
              <Link href={occasion.href} className={ui.buttonOutline + " mt-8"}>
                {occasion.action}
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
