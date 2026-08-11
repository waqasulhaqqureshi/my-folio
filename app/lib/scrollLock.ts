/*
 * Reference-counted scroll lock.
 *
 * THE BUG THIS REPLACES
 * `globals.css` used to ship `body { overflow-y: hidden }` as the *default*
 * state, with the PreLoader writing an inline `overflowY = "auto"` to release
 * it. Every modal then "restored" scroll with:
 *
 *     document.body.style.overflow  = "";
 *     document.body.style.overflowY = "";
 *
 * Clearing an inline style does not restore the previous inline value — it
 * falls back to the STYLESHEET value, which was `hidden`. So opening and
 * closing any blog/certificate modal (or merely mounting one, since the effect
 * ran `unlockBodyScroll()` on mount when `isOpen` was false) permanently killed
 * page scrolling. That is the "scroll stops working after some time" report.
 *
 * THE FIX
 * Scrollable is now the stylesheet default; locking is additive via a class,
 * and it is reference-counted so nested/overlapping owners (preloader + modal)
 * can't unlock each other. Any accidental "reset to default" now yields a
 * scrollable page instead of a dead one.
 */
let lockCount = 0;
const LOCK_CLASS = "is-scroll-locked";

const apply = () => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle(LOCK_CLASS, lockCount > 0);
};

export function lockScroll() {
  lockCount += 1;
  apply();
}

export function unlockScroll() {
  if (lockCount > 0) lockCount -= 1;
  apply();
}

/** Escape hatch: clears every outstanding lock (unmount / error paths). */
export function forceUnlockScroll() {
  lockCount = 0;
  apply();
}
