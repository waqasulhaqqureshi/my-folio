"use client";
import { useEffect, useRef } from "react";

/*
 * useRevealGrid — Phase 1 scroll-entry choreography.
 *
 * WHY NOT framer-motion's whileInView (what the old WorkCard used):
 * each card mounted its own motion component, so N cards = N observers +
 * N animation drivers ticking through React state on the main thread. Here a
 * SINGLE observer is attached to the grid container and watches all children.
 *
 * The observer callback does exactly one thing: toggle a class. It never reads
 * layout (no getBoundingClientRect, no offsetTop), so it cannot force a
 * synchronous reflow. The animation itself is a pure CSS transition on
 * `transform` + `opacity` — both compositor-only properties, so the reveal
 * runs off the main thread entirely.
 *
 * Stagger is delivered via a `--reveal-i` custom property written once at
 * observe-time (not per-frame), letting CSS compute transition-delay.
 * Elements unobserve themselves after revealing: the observer set shrinks to
 * empty and the whole thing is disconnected on unmount.
 */
type Options = {
  /** CSS selector for the children to reveal. */
  itemSelector?: string;
  threshold?: number;
  rootMargin?: string;
  /** Per-item stagger in ms. */
  stagger?: number;
};

export function useRevealGrid<T extends HTMLElement>({
  itemSelector = "[data-reveal]",
  threshold = 0.15,
  rootMargin = "0px 0px -8% 0px",
  stagger = 70,
}: Options = {}) {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>(itemSelector));
    if (!items.length) return;

    // Reduced motion: reveal everything immediately, skip the observer entirely.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.classList.add("is-revealed");
          // One-shot: stop tracking so the callback set drains to zero.
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );

    items.forEach((el, i) => {
      // Stagger index written once — CSS derives the delay from it.
      el.style.setProperty("--reveal-i", String(i % 6));
      el.style.setProperty("--reveal-step", `${stagger}ms`);
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [itemSelector, threshold, rootMargin, stagger]);

  return containerRef;
}
