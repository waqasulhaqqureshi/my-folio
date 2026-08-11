"use client";
import { useEffect, useRef, useState } from "react";

/*
 * useHorizontalPin — the source's scroll choreography, without GSAP.
 *
 * heynesh.com's projects section is NOT a grid. From the live stylesheet:
 *
 *   .work_section { min-height: 400vh; }
 *   .work-sticky  { position: sticky; bottom: 0; min-height: 100vh; }
 *   .work-track-wrap { padding-left: 55%; display: flex; }
 *
 * i.e. the section reserves 400vh of scroll, the inner panel pins to the
 * viewport, and vertical scroll progress is scrubbed onto the horizontal
 * translation of the card track. GSAP ScrollTrigger is not in this project's
 * dependency tree, so the scrub is implemented directly.
 *
 * PERFORMANCE CONTRACT
 * - The scroll listener is passive and stores ONE number (scrollY). It never
 *   reads layout, so it cannot force synchronous reflow while scrolling.
 * - Track/section geometry is measured only on mount, on resize, and when the
 *   card count changes — cached in a ref otherwise. A ResizeObserver catches
 *   font-swap and image-driven size changes.
 * - The rAF loop LERPs current → target and self-terminates within 0.01px, so
 *   an idle or out-of-view section costs zero frames.
 * - The only per-frame write is one `translate3d` on the track: compositor-only.
 * - Below 768px the source drops the pin entirely
 *   (`.work_section{min-height:auto}` / `.work-sticky{position:static}`) and
 *   uses a native overflow-scroll rail; this hook disables itself to match.
 */
export function useHorizontalPin(itemCount: number) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  /** Scroll distance the section must reserve, in px (drives min-height). */
  const [pinHeight, setPinHeight] = useState(0);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const desktop = window.matchMedia("(min-width: 768px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let distance = 0; // px the track must travel horizontally
    let startY = 0; // page Y at which the pin engages
    let range = 1; // scrollable range over which the scrub happens
    let target = 0;
    let current = 0;
    let raf = 0;
    let running = false;
    let active = false;

    const measure = () => {
      if (!active) return;
      // Total overflow of the track beyond the viewport width.
      distance = Math.max(0, track.scrollWidth - window.innerWidth);
      const rect = section.getBoundingClientRect();
      startY = rect.top + window.scrollY;
      // Reserve exactly enough scroll for the horizontal travel, plus one
      // viewport so the last card can rest before the pin releases.
      range = Math.max(1, distance);
      setPinHeight(distance + window.innerHeight);
    };

    const tick = () => {
      current += (target - current) * 0.12;
      if (Math.abs(target - current) < 0.01) {
        current = target;
        running = false;
      }
      track.style.transform = `translate3d(${-current.toFixed(2)}px, 0, 0)`;
      if (running) raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    // Passive: stores a number, schedules a frame. No layout reads here.
    const onScroll = () => {
      if (!active) return;
      const progress = (window.scrollY - startY) / range;
      target = Math.min(Math.max(progress, 0), 1) * distance;
      start();
    };

    const enable = () => {
      active = true;
      setEnabled(true);
      measure();
      onScroll();
    };

    const disable = () => {
      active = false;
      setEnabled(false);
      setPinHeight(0);
      cancelAnimationFrame(raf);
      running = false;
      target = current = 0;
      track.style.transform = ""; // hand control back to the CSS rail
    };

    const evaluate = () => {
      if (desktop.matches && !reduced.matches) enable();
      else disable();
    };

    evaluate();

    const ro = new ResizeObserver(() => measure());
    ro.observe(track);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    desktop.addEventListener("change", evaluate);
    reduced.addEventListener("change", evaluate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      desktop.removeEventListener("change", evaluate);
      reduced.removeEventListener("change", evaluate);
      track.style.transform = "";
    };
  }, [itemCount]);

  return { sectionRef, trackRef, pinHeight, enabled } as const;
}
