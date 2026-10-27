import { ui } from "@/lib/ui";
import SectionHeading from "../SectionHeading";

const finishes = [
  {
    name: "Matte",
    swatch: "bg-[#e3c0b5]",
    description: "Quiet, soft and without the shine.",
    best: "Artful moments & black and white",
  },
  {
    name: "Glossy",
    swatch: "bg-linear-115 from-[#d4a896] via-[#f4dfd4] to-[#d4a896]",
    description: "A bright finish for vibrant stories.",
    best: "Colourful travels & celebrations",
  },
  {
    name: "Linen",
    swatch: "border-4 border-dashed border-terracotta/20 bg-sand",
    description: "A little texture. A lot of character.",
    best: "Wedding stories & family albums",
  },
  {
    name: "Metallic",
    swatch: "bg-linear-to-br from-[#cab9b0] via-[#f4e9e1] to-[#cdb6ac]",
    description: "A pearly sheen with extra depth.",
    best: "Night scenes & striking portraits",
  },
];

export default function PaperGuide() {
  return (
    <section className={ui.section} id="paper-guide">
      <div className={ui.container}>
        <SectionHeading
          eyebrow="It’s a feeling"
          description="Four finishes. Four ways to bring your photographs to life."
        >
          Good on paper.
          <br />
          <em>Even better in your hands.</em>
        </SectionHeading>
        <div className="grid grid-cols-4 gap-7 max-[700px]:grid-cols-2 max-[700px]:gap-x-5 max-[700px]:gap-y-7.5">
          {finishes.map((finish) => (
            <article key={finish.name}>
              <div
                className={`mb-6 grid h-40 place-items-center max-[700px]:h-35 ${finish.swatch}`}
                aria-hidden="true"
              >
                <span className="font-display text-[65px] text-[#8f5947]">Aa</span>
              </div>
              <h3 className="text-base leading-tight font-medium">{finish.name}</h3>
              <p className="mt-3 text-sm text-muted">{finish.description}</p>
              <span className="mt-3.5 block text-xs">{finish.best}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
