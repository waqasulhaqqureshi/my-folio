"use client";
import { useEffect, useRef } from "react";

/*
 * useMagnetic — Phase 3 cursor physics, decoupled from any visual pointer.
 *
 * CONTEXT: this codebase has NO custom cursor element to refactor — the legacy
 * blobity follower was already removed and `globals.css` already restores
 * native `cursor: default` / `cursor: pointer`. So rather than reintroducing a
 * fake pointer, the physics engine is applied to the ELEMENT itself: the
 * invisible native-cursor coordinates drive a LERP-smoothed magnetic pull on
 * the target, plus a click-state expansion. Nothing is painted over the OS
 * cursor, so a11y and hit-testing stay native.
 *
 * MAIN-THREAD DISCIPLINE
 * - pointermove is a passive listener that ONLY stores two numbers.
 * - Geometry (getBoundingClientRect) is read at most once per enter, and on
 *   resize/scroll-idle — never inside the rAF loop, so the loop never triggers
 *   a forced synchronous layout.
 * - The rAF loop is self-terminating: it stops the moment the element has
 *   settled within a sub-pixel epsilon of its rest position, so an idle page
 *   runs zero animation frames.
 * - Writes go to a CSS custom property consumed by a compositor-only
 *   `translate3d`, so no layout/paint work per frame.
 *
 * TOUCH / A11Y EDGE CASES
 * - `(hover: none)` or `(pointer: coarse)` → the engine never attaches.
 * - `prefers-reduced-motion: reduce` → never attaches.
 * - Keyboard focus is unaffected: focus-visible styling is pure CSS, so the
 *   element behaves identically for non-pointer users.
 */

type Options = {
  /** Fraction of the element's half-size the cursor can drag it by (0–1). */
  strength?: number;
  /** LERP smoothing factor per frame (higher = snappier). */
  ease?: number;
  /** Extra px around the element that still counts as "in range". */
  padding?: number;
  /** Scale applied while the pointer is held down. */
  pressScale?: number;
};

export function useMagnetic<T extends HTMLElement>({
  strength = 0.35,
  ease = 0.16,
  padding = 24,
  pressScale = 0.96,
}: Options = {}) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // --- Capability gate: pointer physics is a fine-pointer-only affordance --
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;

    // Cached geometry — the ONLY layout reads in the whole engine.
    let cx = 0;
    let cy = 0;
    let halfW = 0;
    let halfH = 0;
    let geometryStale = true;

    const measure = () => {
      const r = el.getBoundingClientRect();
      cx = r.left + r.width / 2;
      cy = r.top + r.height / 2;
      halfW = r.width / 2;
      halfH = r.height / 2;
      geometryStale = false;
    };

    // Invisible coordinate tracking of the native cursor.
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let pressed = false;
    let rafId = 0;
    let running = false;

    const EPSILON = 0.05;

    const tick = () => {
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;

      const dx = Math.abs(targetX - currentX);
      const dy = Math.abs(targetY - currentY);

      // Snap-and-stop: kill the loop once settled so idle costs 0 frames.
      if (dx < EPSILON && dy < EPSILON) {
        currentX = targetX;
        currentY = targetY;
        running = false;
      }

      el.style.setProperty("--mag-x", `${currentX.toFixed(2)}px`);
      el.style.setProperty("--mag-y", `${currentY.toFixed(2)}px`);
      el.style.setProperty("--mag-scale", pressed ? String(pressScale) : "1");

      if (running) rafId = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(tick);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (geometryStale) measure();

      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      // In-range test uses cached numbers only — no layout read.
      const inRange =
        Math.abs(dx) < halfW + padding && Math.abs(dy) < halfH + padding;

      targetX = inRange ? dx * strength : 0;
      targetY = inRange ? dy * strength : 0;
      start();
    };

    const onPointerEnter = () => {
      measure();
      el.classList.add("is-magnetic-active");
    };

    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
      pressed = false;
      el.classList.remove("is-magnetic-active");
      start(); // let it LERP home rather than snapping
    };

    const onPointerDown = () => {
      pressed = true;
      start();
    };
    const onPointerUp = () => {
      pressed = false;
      start();
    };

    // Geometry invalidation — cheap flag flip, measured lazily on next move.
    const invalidate = () => {
      geometryStale = true;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate, { passive: true });
    el.addEventListener("pointerenter", onPointerEnter);
    el.addEventListener("pointerleave", onPointerLeave);
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointerup", onPointerUp);
    // Blur/focus-out resets the press state if the pointer is released offscreen.
    window.addEventListener("blur", onPointerUp);

    return () => {
      cancelAnimationFrame(rafId);
      running = false;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
      window.removeEventListener("blur", onPointerUp);
      el.removeEventListener("pointerenter", onPointerEnter);
      el.removeEventListener("pointerleave", onPointerLeave);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointerup", onPointerUp);
      el.style.removeProperty("--mag-x");
      el.style.removeProperty("--mag-y");
      el.style.removeProperty("--mag-scale");
      el.classList.remove("is-magnetic-active");
    };
  }, [strength, ease, padding, pressScale]);

  return ref;
}
