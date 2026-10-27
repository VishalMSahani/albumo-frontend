"use client";

import Image from "@/components/CdnImage";
import { useEffect, useRef } from "react";
import { homePosters } from "./home-posters";
import styles from "./home-poster-gallery.module.css";

export default function HomePosterGallery() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const cards = Array.from(stage.querySelectorAll<HTMLElement>("[data-poster]"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let lastTime = 0;
    let remainder = 0;
    let visible = false;
    let touching = false;
    let cycle = 0;
    let width = 0;
    let centers: number[] = [];
    let drag: { pointerId: number; x: number; scrollLeft: number } | null = null;

    const normalize = () => {
      if (!cycle) return;
      const previous = stage.scrollLeft;
      // Three identical groups provide a buffer on both sides. Rebase into the
      // middle group without changing the visible photographs or drag position.
      if (previous < cycle || previous >= cycle * 2) {
        stage.scrollLeft = cycle + ((((previous - cycle) % cycle) + cycle) % cycle);
        if (drag) drag.scrollLeft += stage.scrollLeft - previous;
      }
    };
    const render = () => {
      const scrollLeft = stage.scrollLeft;
      cards.forEach((card, index) => {
        const position = Math.max(
          -1,
          Math.min(1, (centers[index] - scrollLeft - width / 2) / (width / 2)),
        );
        const scale = 0.84 + 0.16 * position ** 2;
        card.style.transform = reducedMotion.matches
          ? "none"
          : `perspective(1100px) rotateY(${-position * 25}deg) scaleY(${scale})`;
        card.style.setProperty(
          "--image-scale-y",
          reducedMotion.matches ? "1" : String(1 / scale),
        );
      });
    };
    const tick = (now: number) => {
      frame = 0;
      const elapsed = lastTime ? Math.min(now - lastTime, 50) : 0;
      lastTime = now;
      const canAnimate = visible && !document.hidden && !reducedMotion.matches;
      if (canAnimate) {
        // Carry fractional pixels so gentle motion works at high refresh rates.
        remainder += elapsed * 0.022;
        const pixels = Math.floor(remainder);
        remainder -= pixels;
        const before = stage.scrollLeft;
        stage.scrollLeft += pixels;
        // Add drift to the drag origin too, so the next pointer move does not
        // undo autoplay or jump back to where the drag began.
        if (drag) drag.scrollLeft += stage.scrollLeft - before;
      }
      normalize();
      render();
      if (canAnimate) frame = requestAnimationFrame(tick);
      else lastTime = 0;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const measure = () => {
      const progress = cycle ? (stage.scrollLeft - cycle) / cycle : 0;
      width = stage.clientWidth;
      centers = cards.map((card) => card.offsetLeft + card.offsetWidth / 2);
      cycle = cards[homePosters.length].offsetLeft - cards[0].offsetLeft;
      stage.scrollLeft = cycle + progress * cycle;
      normalize();
      render();
      schedule();
    };
    const onScroll = () => {
      normalize();
      schedule();
    };
    const pointerDown = (event: PointerEvent) => {
      touching = true;
      delete stage.dataset.keyboardFocus;
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      drag = {
        pointerId: event.pointerId,
        x: event.clientX,
        scrollLeft: stage.scrollLeft,
      };
      stage.setPointerCapture(event.pointerId);
      stage.dataset.dragging = "true";
      stage.focus({ preventScroll: true });
      event.preventDefault();
    };
    const pointerMove = (event: PointerEvent) => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      stage.scrollLeft = drag.scrollLeft + drag.x - event.clientX;
      normalize();
      schedule();
    };
    const pointerEnd = () => {
      touching = false;
      drag = null;
      delete stage.dataset.dragging;
    };
    const focus = () => {
      if (!touching) stage.dataset.keyboardFocus = "true";
    };
    const keyDown = () => {
      stage.dataset.keyboardFocus = "true";
    };
    const blur = () => {
      delete stage.dataset.keyboardFocus;
    };
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(cards[0]);
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      lastTime = 0;
      schedule();
    });
    visibility.observe(stage);
    stage.addEventListener("scroll", onScroll, { passive: true });
    stage.addEventListener("pointerdown", pointerDown);
    stage.addEventListener("pointermove", pointerMove);
    window.addEventListener("pointerup", pointerEnd);
    stage.addEventListener("pointercancel", pointerEnd);
    stage.addEventListener("lostpointercapture", pointerEnd);
    stage.addEventListener("focus", focus);
    stage.addEventListener("keydown", keyDown);
    stage.addEventListener("blur", blur);
    document.addEventListener("visibilitychange", schedule);
    reducedMotion.addEventListener("change", schedule);
    measure();
    return () => {
      observer.disconnect();
      visibility.disconnect();
      cancelAnimationFrame(frame);
      stage.removeEventListener("scroll", onScroll);
      stage.removeEventListener("pointerdown", pointerDown);
      stage.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerup", pointerEnd);
      stage.removeEventListener("pointercancel", pointerEnd);
      stage.removeEventListener("lostpointercapture", pointerEnd);
      stage.removeEventListener("focus", focus);
      stage.removeEventListener("keydown", keyDown);
      stage.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", schedule);
      reducedMotion.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <div className={styles.gallery}>
      <div
        ref={stageRef}
        className={styles.stage}
        role="region"
        aria-label="Photo memories"
        aria-describedby="home-gallery-hint"
        tabIndex={0}
        data-poster-stage
      >
        {[...homePosters, ...homePosters, ...homePosters].map((poster, index) => (
          <div
            key={`${poster.id}-${index}`}
            className={styles.poster}
            data-poster
            aria-hidden={
              index < homePosters.length || index >= homePosters.length * 2
                ? true
                : undefined
            }
          >
            <Image
              src={poster.src}
              alt={poster.alt}
              width={800}
              height={1200}
              sizes="(max-width: 1037px) 187px, (max-width: 1630px) 18vw, 294px"
              className={styles.image}
              draggable={false}
              loading={
                index >= homePosters.length && index < homePosters.length + 7
                  ? "eager"
                  : "lazy"
              }
            />
          </div>
        ))}
      </div>
      <p id="home-gallery-hint" className="mt-3 text-center text-xs text-muted">
        Drag or swipe to explore <span aria-hidden="true">↔</span>
      </p>
    </div>
  );
}
