import { aboutUi } from "./about-ui";

export default function OurStory() {
  return (
    <section className={aboutUi.section} id="our-story" aria-labelledby="story-title">
      <div
        className={`${aboutUi.container} grid gap-9 md:grid-cols-2 md:gap-16 lg:gap-24`}
      >
        <div data-reveal>
          <span className={aboutUi.eyebrow}>Our story</span>
          <h2 id="story-title" className={aboutUi.heading}>
            More life.
            <br />
            <span className="text-muted">Less lost in a folder.</span>
          </h2>
        </div>
        <div
          data-reveal
          className="space-y-5 text-base leading-relaxed text-muted sm:text-lg md:pt-11"
        >
          <p>
            Albumo gives your favourite photographs a life beyond the screen. A travel
            book on your table. A wedding album passed around the room. Something you can
            see, touch and share.
          </p>
          <p className="border-l-2 border-berry/40 pl-5 font-medium text-ink">
            Because a memory feels different when you can hold it.
          </p>
        </div>
      </div>
    </section>
  );
}
