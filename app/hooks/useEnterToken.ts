"use client";
import { useEffect, useState } from "react";

/*
 * useEnterToken — a counter that increments each time a section (re)enters view.
 *
 * WHY A TOKEN AND NOT A BOOLEAN
 * The consumer restarts a CSS animation on entry. A boolean cannot express
 * "this happened again": flipping it back to a value it already held is a
 * no-op to React, and even if it re-rendered, CSS will not replay an animation
 * that has already spent its iteration count. A monotonically increasing
 * number is always a new value, so it can be fed into a `key` to force a fresh
 * element — which is the only reliable way to restart the animation.
 *
 * HYSTERESIS
 * Entry fires at `enterAt` but the token only re-arms once the section has
 * dropped below `exitAt`. Without that dead band, scrolling around the
 * boundary would re-trigger the animation continuously. The section must
 * genuinely be left and returned to.
 *
 * One IntersectionObserver, no scroll listener — nothing runs on the main
 * thread between crossings.
 */
export function useEnterToken(
  sectionId: string,
  { enterAt = 0.35, exitAt = 0.05 }: { enterAt?: number; exitAt?: number } = {}
) {
  const [token, setToken] = useState(0);

  useEffect(() => {
    const el = document.getElementById(sectionId);
    if (!el) return;

    /* Tracks whether the section currently counts as "entered". Held in a
       closure rather than state: it is control flow for the observer, and
       putting it in state would re-run this effect and rebuild the observer
       on every crossing. */
    let inside = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const r = entry.intersectionRatio;
        if (!inside && r >= enterAt) {
          inside = true;
          setToken((n) => n + 1);
        } else if (inside && r <= exitAt) {
          inside = false;
        }
      },
      { threshold: [0, 0.05, 0.2, 0.35, 0.5, 0.75, 1] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [sectionId, enterAt, exitAt]);

  return token;
}
