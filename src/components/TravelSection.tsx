import Link from "next/link";
import { ui } from "@/lib/ui";
import PhotoPlaceholder from "./PhotoPlaceholder";

const travelHighlights = [
  {
    id: "mountains",
    label: "Mountain trek photo",
    caption: "The Himalayas",
  },
  {
    id: "beach",
    label: "Beach sunset photo",
    caption: "Goa sunsets",
  },
  {
    id: "heritage",
    label: "Heritage site photo",
    caption: "Rajasthan forts",
  },
  {
    id: "forest",
    label: "Forest trail photo",
    caption: "Kerala backwaters",
  },
];

export default function TravelSection() {
  return (
    <section className="overflow-hidden bg-ivory py-14 sm:py-18 lg:py-22">
      <div className={ui.container}>
        {/* ── heading row ── */}
        <div className="mb-10 grid items-end gap-6 md:grid-cols-2 md:gap-12 lg:mb-14">
          <div className="max-w-xl">
            <span className={ui.eyebrow}>Travel memories</span>
            <h2 className={ui.heading}>
              Your favourite journey
              <br />
              can be <em>memorable.</em>
            </h2>
          </div>
          <p className="max-w-lg text-base leading-relaxed text-muted md:text-right">
            Don&rsquo;t just limit your photos to your phone.
            <br className="hidden md:inline" /> Get a photo album for your
            favourite trip with Albumo.
          </p>
        </div>

        {/* ── photo grid ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {travelHighlights.map((item) => (
            <div key={item.id} className="group">
              <div className="aspect-[3/4] overflow-hidden rounded-lg">
                <PhotoPlaceholder
                  slot={`travel-${item.id}`}
                  tone="sage"
                  label={item.label}
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                  className="transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="mt-3 text-center text-sm font-medium text-ink">
                {item.caption}
              </p>
            </div>
          ))}
        </div>

        {/* ── feature strip ── */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3 lg:mt-16">
          {[
            {
              icon: "📸",
              title: "Relive the journey",
              desc: "Every page takes you back to the sights, sounds, and stories of your trip.",
            },
            {
              icon: "🎁",
              title: "Gift a memory",
              desc: "Turn a shared adventure into a gift your travel buddies will love.",
            },
            {
              icon: "📖",
              title: "Built to last",
              desc: "Premium paper & binding that keeps your travel tales safe for years.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-line bg-white p-6 text-center sm:p-8"
            >
              <span className="text-3xl" aria-hidden="true">
                {feature.icon}
              </span>
              <h3 className="mt-3 text-base font-semibold text-ink">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="mt-10 flex flex-col items-center gap-4 text-center lg:mt-14">
          <p className="max-w-md text-base leading-relaxed text-muted">
            Your next adventure deserves more than a camera roll.
            <br />
            Make it a photo album with <strong>Albumo</strong>.
          </p>
          <Link href="/products" className={ui.button}>
            Create your travel album <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

