import Image from "@/components/CdnImage";
import { customerStories } from "./customer-stories";
import { homeUi } from "./home-ui";
import styles from "./memory-sections.module.css";

export default function CustomerStories() {
  return (
    <section
      id="customer-stories"
      className={styles.stories}
      aria-labelledby="customer-stories-title"
    >
      <div className={homeUi.container}>
        <div data-reveal className="mx-auto max-w-190 text-center">
          <span className={homeUi.eyebrow}>Notes worth keeping</span>
          <h2 id="customer-stories-title" className={homeUi.heading}>
            What our customers <span className="text-berry">say.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-115 text-base leading-relaxed text-muted sm:text-lg">
            Behind every album, there’s someone worth making it for.
          </p>
          {customerStories.some((story) => story.isSample) && (
            <p className="mt-4 text-xs text-muted">
              Design preview · Sample reviews with illustrative photos.
            </p>
          )}
        </div>
        <div className={styles.storyGrid}>
          {customerStories.map((story, index) => (
            <article
              data-reveal
              data-reveal-delay={index * 100}
              key={story.id}
              className={styles.storyWrap}
            >
              <div className={styles.storyCard}>
                <div className={styles.photo}>
                  <Image
                    src={story.image}
                    alt={story.imageAlt}
                    fill
                    sizes="(max-width: 767px) 90vw, 33vw"
                    className="object-cover"
                  />
                  <span className={styles.photoLabel}>{story.memory}</span>
                  <span aria-hidden="true" className={styles.heart}>
                    ♡
                  </span>
                </div>
                <div className={styles.note}>
                  <span aria-hidden="true" className={styles.quoteMark}>
                    “
                  </span>
                  <blockquote className="relative text-[23px] leading-[1.35] font-medium tracking-[-0.035em]">
                    <p>{story.quote}</p>
                  </blockquote>
                  <div className="mt-6 flex items-center gap-3">
                    <span aria-hidden="true" className={styles.initial}>
                      {story.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-medium">
                        {story.name}
                        {story.isSample && (
                          <span className="ml-2 text-xs font-normal text-muted">
                            Sample review
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">{story.occasion}</p>
                    </div>
                  </div>
                  <details className={styles.letter}>
                    <summary>
                      <span className={styles.closedLabel}>Unfold the story</span>
                      <span className={styles.openLabel}>Keep the note</span>
                      <span aria-hidden="true" className={styles.plus}>
                        +
                      </span>
                    </summary>
                    <p className="pt-4 text-sm leading-relaxed text-muted">
                      {story.note}
                    </p>
                  </details>
                </div>
              </div>
            </article>
          ))}
        </div>
        <p data-reveal className="mt-10 text-center text-sm text-muted">
          A photo remembers the moment. An album remembers the feeling.
        </p>
      </div>
    </section>
  );
}
