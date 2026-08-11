"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/*
 * useTrackCarousel — arrow-driven horizontal rail for the projects track.
 *
 * REPLACES the 400vh scroll-pin scrub (useHorizontalPin). Hijacking vertical
 * scroll to drive horizontal motion is disorienting: the user cannot tell how
 * much runway is left, cannot skip ahead, and the page appears frozen while the
 * track animates. Explicit prev/next controls hand that agency back — and they
 * are keyboard- and screen-reader-operable, which a scroll-scrub never is.
 *
 * IMPLEMENTATION
 * The rail is a real scroll container (`overflow-x: auto`), so native trackpad
 * swipe, touch drag, and scrollbar dragging all keep working; the arrows simply
 * call scrollBy(). That means no transform bookkeeping and no fighting the
 * browser's own scroll-snap.
 *
 * PERFORMANCE
 * - Edge state (canPrev/canNext) is recomputed in a passive scroll listener
 *   that is rAF-throttled, so at most one layout read per frame.
 * - A ResizeObserver catches card reflow (font swap, viewport change) without
 *   polling.
 */
export function useTrackCarousel() {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const frame = useRef(0);

  const measure = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    // 2px tolerance absorbs sub-pixel rounding at the extremes.
    setCanPrev(el.scrollLeft > 2);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;

    const onScroll = () => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(measure);
    };

    measure();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // Card widths are vw-based, so a viewport change alters the overflow.
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame.current);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      ro.disconnect();
    };
  }, [measure]);

  /** Scroll by exactly one card + gap, so cards never end up half-cropped. */
  const step = useCallback((dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".work-card");
    const track = el.firstElementChild;
    // columnGap resolves to "normal" on non-grid/flex parents — coerce to 0.
    const gap = track ? parseFloat(getComputedStyle(track).columnGap) || 0 : 0;
    const delta = card ? card.offsetWidth + gap : el.clientWidth * 0.8;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * delta, behavior: reduced ? "auto" : "smooth" });
  }, []);

  return { railRef, canPrev, canNext, prev: () => step(-1), next: () => step(1) } as const;
}
