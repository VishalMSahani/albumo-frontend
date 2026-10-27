import { aboutUi } from "./about-ui";

const values = [
  {
    title: "The memory comes first.",
    description:
      "A good design lets the photograph do the talking. We leave room for what matters.",
    path: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  },
  {
    title: "Details make the difference.",
    description:
      "The paper, the finish, the way a page turns. Small choices that make a book feel personal.",
    path: "m12 3 2.7 6.3L21 12l-6.3 2.7L12 21l-2.7-6.3L3 12l6.3-2.7L12 3Z",
  },
  {
    title: "Every story belongs.",
    description:
      "Big adventures and ordinary Tuesdays. There’s no right occasion to preserve a moment.",
    path: "M3 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-3H3V4Zm18 0h-6a3 3 0 0 0-3 3v14a4 4 0 0 1 4-3h5V4Z",
  },
];

export default function OurValues() {
  return (
    <section
      className="relative bg-surface py-16 sm:py-24"
      id="our-values"
      aria-labelledby="values-title"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,var(--color-rose),transparent_70%)]"
      />
      <div className={`${aboutUi.container} relative`}>
        <div data-reveal className="mx-auto mb-10 max-w-160 text-center sm:mb-14">
          <span className={aboutUi.eyebrow}>What matters to us</span>
          <h2 id="values-title" className={aboutUi.heading}>
            Simple things.
            <br />
            <span className="text-berry">Thoughtfully done.</span>
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3 lg:gap-6">
          {values.map((value, index) => (
            <article
              data-reveal
              data-reveal-delay={index * 140}
              key={value.title}
              className={`${aboutUi.glass} rounded-3xl p-7 transition-[translate,box-shadow] duration-500 hover:-translate-y-2 hover:shadow-[0_20px_45px_-20px_#c63f6530] motion-reduce:translate-none motion-reduce:transition-none sm:p-8`}
            >
              <div className="mb-10 flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-2xl border border-white bg-rose/80 text-berry shadow-[inset_0_1px_0_#fff]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path d={value.path} />
                  </svg>
                </span>
                <span className="text-xs font-medium text-muted">0{index + 1}</span>
              </div>
              <h3 className="max-w-60 text-[22px] leading-tight font-medium tracking-[-0.035em]">
                {value.title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-muted">
                {value.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
