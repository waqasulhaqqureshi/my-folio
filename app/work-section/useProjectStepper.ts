"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/*
 * useProjectStepper — discrete index navigation for the one-at-a-time device view.
 *
 * WHY NOT REUSE useTrackCarousel
 * That hook drives a native scroll container and derives its edge state by
 * reading scrollLeft. With a single item on screen there is nothing to scroll:
 * the state IS the index. Modelling it as scroll offsets would mean measuring
 * layout to answer a question we already know the answer to, and would make
 * "which project is showing" a derived, race-prone value rather than the
 * source of truth.
 *
 * Non-wrapping by design: the arrows disable at the ends so the length of the
 * roster stays legible. A wrapping carousel gives the user no sense of how
 * much is left, which is the exact complaint that killed the scroll-scrub.
 */
export function useProjectStepper(count: number) {
  const [index, setIndex] = useState(0);
  // Direction feeds the slide animation: +1 entered from the right, -1 the left.
  const [direction, setDirection] = useState<1 | -1>(1);
  const liveRef = useRef<HTMLDivElement | null>(null);

  const clamp = useCallback(
    (n: number) => Math.min(Math.max(n, 0), Math.max(count - 1, 0)),
    [count]
  );

  const go = useCallback(
    (next: number) => {
      setIndex((current) => {
        const target = clamp(next);
        if (target === current) return current;
        setDirection(target > current ? 1 : -1);
        return target;
      });
    },
    [clamp]
  );

  const prev = useCallback(() => go(index - 1), [go, index]);
  const next = useCallback(() => go(index + 1), [go, index]);

  const canPrev = index > 0;
  const canNext = index < count - 1;

  /*
   * Left/Right arrow keys step the carousel when focus is inside it.
   * Bound to the container, not window: a global listener would hijack arrow
   * keys from every other control on the page.
   */
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        prev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      }
    },
    [prev, next]
  );

  // A clamp is needed if `count` ever shrinks below the current index.
  useEffect(() => {
    setIndex((i) => clamp(i));
  }, [clamp]);

  return { index, direction, prev, next, canPrev, canNext, go, onKeyDown, liveRef } as const;
}
