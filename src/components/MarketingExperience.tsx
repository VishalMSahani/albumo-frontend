"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/** One entrance per element per visit. Native animations keep scroll work off React. */
export default function MarketingExperience({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const element = root.current;
    if (!element || !("IntersectionObserver" in window) || !element.animate) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const seen = new WeakSet<HTMLElement>();
    const animations = new Map<HTMLElement, Animation>();
    const reveal = (item: HTMLElement) => {
      if (seen.has(item)) return;
      seen.add(item);
      animations.get(item)?.play();
      observer.unobserve(item);
    };
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) reveal(entry.target as HTMLElement);
        }),
      { threshold: 0, rootMargin: "0px 0px -32px 0px" },
    );
    const register = () => {
      element.querySelectorAll<HTMLElement>("[data-reveal]").forEach((item) => {
        if (seen.has(item) || animations.has(item)) return;
        if (preference.matches) {
          seen.add(item);
          return;
        }
        // Do not hide content already passed by a deep link or scroll restoration.
        if (item.getBoundingClientRect().bottom <= 0) {
          seen.add(item);
          return;
        }
        const animation = item.animate(
          [
            { opacity: 0, transform: "translate3d(0, 32px, 0)" },
            { opacity: 1, transform: "translate3d(0, 0, 0)" },
          ],
          {
            duration: 900,
            delay: Math.min(400, Number(item.dataset.revealDelay) || 0),
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            fill: "both",
          },
        );
        animation.pause();
        animation.currentTime = 0;
        // Release the animation layer once its single entrance is complete.
        animation.onfinish = () => animation.cancel();
        animations.set(item, animation);
        observer.observe(item);
      });
      animations.forEach((animation, item) => {
        if (!element.contains(item)) {
          observer.unobserve(item);
          animation.cancel();
          animations.delete(item);
        }
      });
    };
    const focus = (event: FocusEvent) => {
      if (!(event.target instanceof Node)) return;
      animations.forEach((animation, item) => {
        if (item.contains(event.target as Node)) {
          seen.add(item);
          observer.unobserve(item);
          animation.cancel();
        }
      });
    };
    const reduce = () => {
      if (!preference.matches) return;
      observer.disconnect();
      animations.forEach((animation, item) => {
        seen.add(item);
        animation.cancel();
      });
    };
    // Include streamed sections and async page content without restarting old reveals.
    const mutations = new MutationObserver(register);
    register();
    mutations.observe(element, { childList: true, subtree: true });
    element.addEventListener("focusin", focus);
    preference.addEventListener("change", reduce);
    return () => {
      mutations.disconnect();
      observer.disconnect();
      element.removeEventListener("focusin", focus);
      preference.removeEventListener("change", reduce);
      animations.forEach((animation) => animation.cancel());
    };
  }, [pathname]);

  return (
    <div ref={root} className="overflow-clip font-sans">
      {children}
    </div>
  );
}
