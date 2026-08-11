"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./preloader.css";
import { lockScroll, unlockScroll, forceUnlockScroll } from "../../lib/scrollLock";

/*
 * PreLoader — lifecycle-orchestrated intro overlay.
 *
 * Sequence (≈3.9s total):
 *   1. Overlay covers the app on the very first paint (fixed, z-55) — content
 *      is inert until the sequence completes.
 *   2. Three strings reveal strictly sequentially in ONE center mask:
 *      "Developer," → "Designer," → "Driller." (rise 110% → 0, hold, exit ↑).
 *   3. The canvas panel wipes upward and the component UNMOUNTS
 *      (returns null) — no DOM residue; every timer is cleared in cleanup.
 *
 * Theme: strictly global light theme — var(--canvas) bg, ink type, Tr 3 A
 * display face (inherited from the Hero token layer). No dark flash.
 * Scroll contract: globals.css pins `body { overflow-y: hidden }`; scroll is
 * released exactly when the exit wipe starts, and unconditionally on unmount
 * (leak-proof). A11y: reduced-motion ≈ static 400ms flash; click/Escape skips.
 */

const WORDS = ["Developer,", "Designer,", "Driller."] as const;

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const FIRST_DELAY = 0.45;
const WORD_STEP = 1.05; // in .42s · hold .33s · out .30s
const EXIT_AFTER = FIRST_DELAY + WORDS.length * WORD_STEP; // ≈ 3.6s → wipe
const EXIT_DURATION = 0.7;

const PreLoader = () => {
  const [wordIndex, setWordIndex] = useState(0);
  const [phase, setPhase] = useState<"run" | "exit" | "done">("run");

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Ref-counted: the preloader owns exactly one lock for its lifetime.
    let holdsLock = true;
    lockScroll();
    const releaseScroll = () => {
      if (!holdsLock) return;
      holdsLock = false;
      unlockScroll();
    };

    // Broadcast the lifecycle moment to orchestrated components (Hero FLIP):
    // fired when the exit wipe begins, i.e. when content becomes visible.
    const announceExit = () => {
      window.dispatchEvent(new CustomEvent("nm:intro-exit"));
    };

    const timers: number[] = [];
    const stepMs = reduced ? 120 : WORD_STEP * 1000;
    const exitMs = reduced ? 400 : EXIT_AFTER * 1000;

    // Word sequencer — one word at a time.
    WORDS.forEach((_, i) => {
      if (i === 0) return;
      timers.push(
        window.setTimeout(() => setWordIndex(i), FIRST_DELAY * 1000 + i * stepMs)
      );
    });

    // Exit wipe trigger.
    timers.push(
      window.setTimeout(() => {
      setPhase("exit");
      releaseScroll();
      announceExit();
    }, exitMs)
    );

    const skip = () => {
      setPhase("exit");
      releaseScroll();
      announceExit();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("keydown", onKey);
      releaseScroll(); // never leave the page locked on unmount
    };
  }, []);

  if (phase === "done") return null; // clean unmount — zero DOM residue

  return (
    <motion.div
      className="preloader"
      role="status"
      aria-label={`Loading — ${WORDS.join(" ")}`}
      initial={{ y: 0 }}
      animate={phase === "exit" ? { y: "-100%" } : { y: 0 }}
      transition={{ duration: EXIT_DURATION, ease: EASE }}
      onAnimationComplete={() => {
        if (phase === "exit") {
          setPhase("done");
          window.dispatchEvent(new CustomEvent("nm:intro-complete"));
        }
      }}
      onClick={() => {
        if (phase === "run") {
          forceUnlockScroll();
          window.dispatchEvent(new CustomEvent("nm:intro-exit"));
          setPhase("exit");
        }
      }}
    >
      <div className="texts-container" aria-hidden="true">
        <div className="word-viewport">
          <AnimatePresence mode="wait">
            <motion.span
              key={WORDS[wordIndex]}
              className="word-line"
              initial={{ y: "115%" }}
              animate={{
                y: "0%",
                transition: { duration: 0.42, ease: EASE, delay: wordIndex === 0 ? FIRST_DELAY : 0 },
              }}
              exit={{
                y: "-115%",
                transition: { duration: 0.3, ease: EASE },
              }}
            >
              {WORDS[wordIndex]}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* progress hairline — mirrors the word count */}
        <div className="preloader-track" aria-hidden="true">
          <motion.span
            className="preloader-progress"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: (wordIndex + 1) / WORDS.length }}
            transition={{ duration: 0.5, ease: EASE }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default PreLoader;
