import Image from "@/components/CdnImage";
import { aboutUi } from "./about-ui";

const founder = {
  name: "Vishal Sahani",
  introduction: "Software engineer and brand designer",
};

export default function OurFounder() {
  return (
    <section
      className={`${aboutUi.container} pb-16 sm:pb-24`}
      id="our-founder"
      aria-labelledby="founder-title"
    >
      <div
        data-reveal
        className="relative isolate overflow-hidden rounded-[28px] border border-line/70 bg-sand p-7 sm:rounded-[36px] sm:p-12"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_100%_0%,var(--color-rose),transparent_70%)]"
        />
        <div className="grid items-center gap-8 md:grid-cols-[0.75fr_1.25fr] md:gap-12 lg:gap-16">
          <div className="mx-auto w-full max-w-80 md:max-w-none">
            <Image
              src="/vishal-img.png"
              alt="Vishal Sahani, founder of Albumo, in the mountains"
              width={716}
              height={730}
              sizes="(max-width: 767px) 320px, (max-width: 1200px) 35vw, 380px"
              className="h-auto w-full object-contain"
            />
          </div>
          <div>
            <span className={aboutUi.eyebrow}>A note from our founder</span>
            <blockquote className="space-y-5 text-lg leading-relaxed tracking-[-0.02em] sm:text-xl lg:text-2xl">
              <p>
                Your photos hold the people, places and little moments that make life
                yours. My hope for Albumo is simple: to help you turn those memories into
                something you can hold, share and return to.
              </p>
              <p>Thank you for letting us be part of your story.</p>
            </blockquote>
            <h2
              id="founder-title"
              className="mt-8 text-xl leading-tight font-medium tracking-[-0.025em]"
            >
              {founder.name}
            </h2>
            <p className="mt-2 text-sm text-muted">{founder.introduction}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
