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
 * WRAPPING: prev at the first project jumps to the last, and next at the last
 * returns to the first. The arrows are therefore never disabled — a dead
 * control at 1/9 looks broken, and the "how much is left" signal the disabled
 * state used to give is carried by the visible NN / NN counter and the dot
 * row instead.
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

  /** Absolute jump (dots) — clamped, never wrapped. */
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

  /*
   * Relative step (arrows) — wraps via modulo.
   *
   * Uses the functional updater and derives the target from `current` rather
   * than the captured `index`, so two fast clicks cannot both compute from the
   * same stale index and land on the same slide.
   *
   * Direction stays the direction of TRAVEL, not of the index change: wrapping
   * 8 -> 0 is still a forward move, and animating it backwards would look like
   * the carousel rewound through every slide.
   */
  const step = useCallback(
    (delta: 1 | -1) => {
      if (count < 1) return;
      setDirection(delta);
      setIndex((current) => (current + delta + count) % count);
    },
    [count]
  );

  const prev = useCallback(() => step(-1), [step]);
  const next = useCallback(() => step(1), [step]);

  // Retained for API compatibility; both are always true while a roster exists,
  // since the arrows wrap. A single-project roster has nowhere to go.
  const canPrev = count > 1;
  const canNext = count > 1;

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
