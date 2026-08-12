"use client";
import { useEffect, useState } from "react";

/*
 * useDockGenie — collapse the nav dock while a given section owns the screen.
 *
 * WHY
 * The projects section is the tallest, densest thing on the page and the dock
 * sits right where its controls and caption land. Rather than overlap it, the
 * dock minimises to a small pill (a macOS-style genie) and expands again on
 * the way out.
 *
 * PERFORMANCE — this is the whole reason the hook exists rather than a scroll
 * handler:
 *
 *   1. Detection is ONE IntersectionObserver. No scroll listener, so nothing
 *      runs on the main thread between crossings. A scroll handler here would
 *      fire ~100x/second and each call would read layout to decide the state.
 *
 *   2. The threshold is HYSTERETIC. A single ratio would flip the dock open
 *      and shut repeatedly while the user hovers near the boundary, and each
 *      flip is a layout + paint. Collapse at 0.55, expand at 0.35: inside that
 *      band nothing changes.
 *
 *   3. The state is a boolean consumed as a data-attribute. The animation is
 *      pure CSS transform/opacity/filter on the compositor — React never runs
 *      per frame, and no JS touches the element during the transition.
 *
 * Returns `true` when the dock should be minimised.
 */
export function useDockGenie(sectionId: string) {
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    const el = document.getElementById(sectionId);
    if (!el) return;

    // Respect the OS setting: a dock that vanishes and reappears is exactly
    // the kind of motion this preference exists to suppress.
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;

    const COLLAPSE_AT = 0.55;
    const EXPAND_AT = 0.35;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const r = entry.intersectionRatio;
        /* Hysteresis: only act outside the dead band, and use the functional
           updater so an unchanged value bails without a re-render. */
        setMinimized((was) => {
          if (!was && r >= COLLAPSE_AT) return true;
          if (was && r <= EXPAND_AT) return false;
          return was;
        });
      },
      {
        /* A coarse ladder, not a 0..1 sweep. Every extra threshold is another
           callback per scroll; 9 steps resolves the two trigger points to
           within ~0.1 of the ratio, which is finer than the eye can tell. */
        threshold: [0, 0.15, 0.3, 0.35, 0.45, 0.55, 0.65, 0.8, 1],
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [sectionId]);

  return minimized;
}
