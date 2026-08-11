"use client";
import { useCallback, useEffect, useRef } from "react";

/*
 * useFitText — scale a text node so it spans its container's width exactly.
 *
 * WHY THIS EXISTS
 * heynesh.com ships the NESH wordmark as an inline SVG path, so it fills
 * `.nesh-logo` (94.44vw, aspect-ratio 3.5) precisely at every viewport. We
 * render live text instead — which keeps it selectable, translatable and
 * recolourable — but that means the width depends on font metrics we cannot
 * know ahead of time. A hardcoded `font-size: 24vw` spans roughly 77vw, so the
 * mark floats short of both edges and the whole hero reads "zoomed out"
 * compared to the source.
 *
 * TECHNIQUE
 * Measure the glyph run once at a reference size, then solve for the size that
 * hits the target width: fontSize = target / natural * REF. Because type scales
 * linearly, this is exact in one pass — no binary search, no reflow loop.
 *
 * TWO CORRECTNESS TRAPS, both handled:
 * 1. Fonts load async. Measuring before "Tr 3 A" arrives locks in Arial's
 *    metrics and the mark ends up the wrong size forever. We re-fit on
 *    document.fonts.ready.
 * 2. `scrollWidth` rounds to whole pixels; at ~30vw that rounding is visible as
 *    a 1-2px gap at the right edge. getBoundingClientRect keeps subpixels.
 */
export function useFitText<
  B extends HTMLElement = HTMLDivElement,
  T extends HTMLElement = HTMLSpanElement,
>() {
  const boxRef = useRef<B | null>(null);
  const textRef = useRef<T | null>(null);
  const frame = useRef(0);

  const fit = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const box = boxRef.current;
      const el = textRef.current;
      if (!box || !el) return;

      const target = box.clientWidth;
      if (!target) return; // display:none (mobile tier) — nothing to solve for

      const REF = 100;
      el.style.fontSize = `${REF}px`;
      const natural = el.getBoundingClientRect().width;
      if (!natural) return;

      el.style.fontSize = `${(target / natural) * REF}px`;
    });
  }, []);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    fit();

    // Observe the BOX, never the text: the text's width is an output of this
    // effect, so observing it would feed the resize back into itself.
    const ro = new ResizeObserver(fit);
    ro.observe(box);

    let cancelled = false;
    document.fonts?.ready
      .then(() => {
        if (!cancelled) fit();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame.current);
      ro.disconnect();
    };
  }, [fit]);

  return { boxRef, textRef } as const;
}
