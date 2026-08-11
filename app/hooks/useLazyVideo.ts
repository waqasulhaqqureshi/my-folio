"use client";
import { useEffect, useRef, useState } from "react";

/*
 * useLazyVideo — Phase 2 lifecycle contract for local <video> nodes.
 *
 * THE MEMORY-LEAK PROBLEM THIS SOLVES
 * A <video> that has begun buffering holds a decoded frame buffer, a media
 * element source, and (for VP8/VP9) a hardware decoder handle. Setting
 * `display:none`, unmounting the React subtree, or simply scrolling away does
 * NOT deterministically release these — Chromium keeps the resource alive
 * until GC runs, and with N cards you accumulate N decoders. On a 6-card grid
 * that is ~6 simultaneous VP9 decoders and tens of MB of retained buffers.
 *
 * The only reliable teardown is the WHATWG "load algorithm" reset:
 *   1. pause()
 *   2. removeAttribute("src") + drop any <source> children
 *   3. load()   ← forces the element back to NETWORK_EMPTY and frees buffers
 *
 * STRATEGY
 * A single shared IntersectionObserver per hook instance drives three states:
 *   idle    → no src attached at all, poster only. Zero network, zero decoder.
 *   primed  → within rootMargin: src attached, preload="metadata" only.
 *   active  → ≥40% visible: play(). Leaving that band pauses.
 *   evicted → fully out of the far band: full teardown per above.
 *
 * All observer callbacks are O(1) and touch no layout-reading APIs, so nothing
 * here can force a synchronous reflow on the main thread.
 */

type LazyVideoState = "idle" | "primed" | "active";

type Options = {
  /** Distance ahead of the viewport at which to attach src + buffer metadata. */
  primeMargin?: string;
  /** Visibility ratio at which playback starts. */
  playThreshold?: number;
  /** Fully release the decoder once scrolled beyond the prime band. */
  evictOnExit?: boolean;
};

export function useLazyVideo(src: string, options: Options = {}) {
  const {
    primeMargin = "400px 0px",
    playThreshold = 0.4,
    evictOnExit = true,
  } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [state, setState] = useState<LazyVideoState>("idle");
  // Mirror of `state` for use inside observer callbacks without re-subscribing.
  const stateRef = useRef<LazyVideoState>("idle");
  const setPhase = (next: LazyVideoState) => {
    if (stateRef.current === next) return;
    stateRef.current = next;
    setState(next);
  };

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    /* Stop Chromium reserving a cast/remote-playback pipeline for a purely
       decorative loop. Not in React's prop types, so it is set imperatively. */
    el.setAttribute("disableRemotePlayback", "");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Save-Data / 2g users never get the motion layer at all.
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
      .connection;
    if (reduced || conn?.saveData || /2g/.test(conn?.effectiveType ?? "")) return;

    /** Full WHATWG media reset — the actual leak fix. */
    const release = () => {
      try {
        el.pause();
        el.removeAttribute("src");
        while (el.firstChild) el.removeChild(el.firstChild);
        el.load(); // → NETWORK_EMPTY, frees buffers + decoder handle
      } catch {
        /* element already detached */
      }
      setPhase("idle");
    };

    const attach = () => {
      if (el.getAttribute("src") === src) return;
      el.setAttribute("src", src);
      el.preload = "metadata";
      setPhase("primed");
    };

    // --- Band 1: prime / evict (wide margin) --------------------------------
    const primeObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) attach();
        else if (evictOnExit) release();
      },
      { rootMargin: primeMargin, threshold: 0 }
    );

    // --- Band 2: play / pause (tight, visibility-driven) --------------------
    const playObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          attach();
          // play() rejects if interrupted mid-load; swallow, never throw.
          void el.play().then(
            () => setPhase("active"),
            () => undefined
          );
        } else if (!el.paused) {
          el.pause();
          if (stateRef.current === "active") setPhase("primed");
        }
      },
      { threshold: playThreshold }
    );

    primeObserver.observe(el);
    playObserver.observe(el);

    // Never burn a decoder on a backgrounded tab.
    const onVisibility = () => {
      if (document.hidden) el.pause();
      else if (stateRef.current === "active") void el.play().catch(() => undefined);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      primeObserver.disconnect();
      playObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      release(); // teardown on unmount — the case React alone will not handle
    };
  }, [src, primeMargin, playThreshold, evictOnExit]);

  return { videoRef, state } as const;
}
