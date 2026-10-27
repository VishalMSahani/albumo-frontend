import { ui } from "@/lib/ui";
import Link from "next/link";
import SectionHeading from "../SectionHeading";

const moments = [
  {
    name: "Another year, another story.",
    occasion: "Birthdays",
    href: "/products?q=birthday",
  },
  {
    name: "Here’s to everything ahead.",
    occasion: "Graduations",
    href: "/products",
  },
  {
    name: "All the chapters together.",
    occasion: "Anniversaries",
    href: "/products?q=wedding",
  },
  {
    name: "Good work. Great people.",
    occasion: "Teams & events",
    href: "/contact?intent=custom",
  },
];

export default function OccasionShowcase() {
  return (
    <section className={`${ui.section} bg-paper`}>
      <div className={ui.container}>
        <SectionHeading eyebrow="And all the chapters in between">
          There’s always <em>a reason.</em>
        </SectionHeading>
        <div className="[&_a]:grid [&_a]:grid-cols-[60px_1fr_150px_24px] [&_a]:items-center [&_a]:gap-[25px] [&_a]:border-t [&_a]:border-line [&_a]:py-[26px] max-[700px]:[&_a]:grid-cols-[25px_1fr_20px] max-[700px]:[&_a]:gap-3 [&_a:hover_h3]:text-berry [&_a:last-child]:border-b [&_h3]:font-display [&_h3]:text-3xl [&_h3]:font-medium [&_h3]:tracking-[-0.02em] max-[700px]:[&_h3]:text-[23px]">
          {moments.map((moment, index) => (
            <Link data-reveal key={moment.occasion} href={moment.href}>
              <span className="text-sm text-muted">0{index + 4}</span>
              <h3>{moment.name}</h3>
              <span className="text-sm text-muted max-[700px]:col-start-2 max-[700px]:row-start-2">
                {moment.occasion}
              </span>
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
