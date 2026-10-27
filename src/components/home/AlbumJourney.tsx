import Image from "@/components/CdnImage";
import Link from "next/link";
import { cx } from "@/lib/cx";
import { ui } from "@/lib/ui";
import { homeUi } from "./home-ui";
import styles from "./memory-sections.module.css";

const chapters = [
  {
    number: "01",
    label: "The feeling",
    title: "Start with a ‘remember when?’",
    text: "The little hand in yours. That sea breeze. A laugh you can almost hear. Choose the photos that take you somewhere.",
    caption: "A moment worth keeping",
    image: "/images/home/poster-family.webp",
  },
  {
    number: "02",
    label: "The telling",
    title: "Give the moments a rhythm.",
    text: "Bring the big days and the quiet in-between together. A date, a few words, a little space. Page by page, your photos become a story.",
    caption: "Your story, page by page",
    image: "/images/home/poster-coast.webp",
  },
  {
    number: "03",
    label: "The making",
    title: "Let the story leave the screen.",
    text: "Photographs become printed pages. Pages come together inside a cover. What lived on a phone becomes something you can hold with both hands.",
    caption: "From pixels to pages",
    image: "/images/home/poster-mountains.webp",
  },
  {
    number: "04",
    label: "The keeping",
    title: "Make room for ‘one more look.’",
    text: "On the coffee table. In a gift for someone you miss. Opened again on an ordinary Sunday. This is where your album’s next chapter begins.",
    caption: "Made to come back to",
    image: "/images/home/poster-family.webp",
  },
];

export default function AlbumJourney() {
  return (
    <section
      id="album-journey"
      className={styles.journey}
      aria-labelledby="album-journey-title"
    >
      <div className={cx(homeUi.container, styles.journeyGrid)}>
        <div className={styles.journeyIntro}>
          <div data-reveal>
            <span className={homeUi.eyebrow}>The making of a memory</span>
            <h2 id="album-journey-title" className={homeUi.heading}>
              Before it’s an album,
              <br />
              <span className="text-berry">it’s a feeling.</span>
            </h2>
            <p className="mt-6 max-w-100 text-base leading-relaxed text-muted sm:text-lg">
              A small journey from “I love this photo” to “I’m so glad we kept it.”
            </p>
          </div>
          <div data-reveal className={styles.bookScene}>
            <div className={styles.book}>
              <div className={styles.bookPhoto}>
                <Image
                  src="/images/home/poster-family.webp"
                  alt="A mother and child laughing together, shown in an illustrative album spread"
                  fill
                  sizes="(max-width: 767px) 40vw, 220px"
                  className="object-cover"
                />
              </div>
              <div className={styles.bookPage}>
                <span aria-hidden="true" className="text-3xl text-berry">
                  ♡
                </span>
                <p className="mt-4 text-[clamp(19px,2.2vw,30px)] leading-tight font-medium tracking-[-0.04em]">
                  The days
                  <br />
                  we’ll wish
                  <br />
                  we could
                  <br />
                  <span className="text-berry">do twice.</span>
                </p>
                <span className="mt-6 text-[10px] tracking-widest text-muted uppercase">
                  Our little life
                </span>
              </div>
            </div>
            <p className={styles.bookTag}>Some things feel better in your hands.</p>
          </div>
          <Link href="/products" className={cx(ui.textLink, "mt-3")}>
            Give your memories a home <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <ol className={styles.chapters}>
          {chapters.map((chapter, index) => (
            <li
              key={chapter.number}
              data-reveal
              data-reveal-delay={index * 70}
              className={styles.chapter}
            >
              <span aria-hidden="true" className={styles.chapterNumber}>
                {chapter.number}
              </span>
              <div className={styles.chapterContent}>
                <p className="text-[11px] font-medium tracking-[0.14em] text-berry uppercase">
                  {chapter.label}
                </p>
                <h3 className="mt-3 max-w-90 text-[26px] leading-[1.15] font-medium tracking-[-0.04em]">
                  {chapter.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
                  {chapter.text}
                </p>
                <div className={styles.chapterFoot}>
                  <Image
                    src={chapter.image}
                    alt=""
                    width={36}
                    height={44}
                    className="h-11 w-9 rounded-md object-cover"
                  />
                  <span className="text-xs text-muted">{chapter.caption}</span>
                  <span aria-hidden="true" className="ml-auto text-berry">
                    ♡
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
