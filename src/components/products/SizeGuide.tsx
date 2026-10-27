import { ui } from "@/lib/ui";
import SectionHeading from "../SectionHeading";

const sizes = [
  {
    size: "5 × 7",
    name: "The little companion",
    best: "Travel notes & thoughtful gifts",
    shape: "h-[84px] w-15",
  },
  {
    size: "8 × 8",
    name: "The everyday favourite",
    best: "Weekends, friends & everyday life",
    shape: "size-[86px]",
  },
  {
    size: "10 × 10",
    name: "The coffee-table story",
    best: "Your best trips & family chapters",
    shape: "size-[105px]",
  },
  {
    size: "12 × 12",
    name: "The big occasion",
    best: "Weddings & once-in-a-lifetime days",
    shape: "size-[126px]",
  },
];

export default function SizeGuide() {
  return (
    <section className={`${ui.section} bg-paper`} id="size-guide">
      <div className={ui.container}>
        <SectionHeading
          eyebrow="A little perspective"
          description="All dimensions are in inches. Available sizes vary by product."
        >
          Find your <em>kind of space.</em>
        </SectionHeading>
        <div className="grid grid-cols-4 gap-9 max-[700px]:grid-cols-2 max-[700px]:gap-6">
          {sizes.map((item) => (
            <article key={item.size}>
              <div className="mb-5 flex h-[150px] items-end border-b border-line pb-4">
                <div
                  className={`grid place-items-center border border-l-4 border-terracotta bg-[#efe1d5] ${item.shape}`}
                >
                  <span className="text-sm">{item.size}</span>
                </div>
              </div>
              <h3 className="text-base leading-tight font-medium">{item.name}</h3>
              <p className="mt-2.5 max-w-45 text-sm text-muted">{item.best}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
