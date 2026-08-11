"use client";

import { useEffect, useRef } from "react";

/*
 * Reading-progress bar.
 *
 * Progress needs a new value on every frame of scrolling, so this uses a
 * passive scroll listener coalesced into a single rAF that writes a transform
 * directly to the DOM node. Driving it through React state instead would
 * re-render the subtree on every scroll event.
 *
 * scaleX on a pre-sized element is used rather than animating `width`, so the
 * bar stays on the compositor and never triggers layout.
 */
export default function ArticleChrome() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      // Guard the divide: when the article is shorter than the viewport,
      // scrollHeight === clientHeight and the ratio would be NaN.
      const max = doc.scrollHeight - doc.clientHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0;
      bar.style.transform = `scaleX(${ratio})`;
    };

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-50 h-[3px]">
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-accent"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
