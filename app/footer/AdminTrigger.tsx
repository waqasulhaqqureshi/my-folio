"use client";
import { useRef } from "react";
import { useRouter } from "next/navigation";

/*
 * Hidden admin entry point: double-tap / double-click the copyright line.
 *
 * WHY NOT onDoubleClick
 * That event does not fire reliably on touch devices — mobile browsers
 * synthesise it inconsistently and often swallow the second tap as a
 * double-tap-to-zoom gesture. Tracking two pointerup events inside a window
 * works identically for mouse, pen and touch.
 *
 * The 400ms window matches the platform double-tap convention; anything longer
 * starts catching two deliberate separate taps.
 */
const WINDOW_MS = 400;
/** Two taps far apart are two separate taps, not a double-tap. */
const SLOP_PX = 28;

export default function AdminTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const last = useRef<{ t: number; x: number; y: number } | null>(null);
  const router = useRouter();

  function onPointerUp(e: React.PointerEvent) {
    const now = performance.now();
    const prev = last.current;
    const near =
      prev &&
      now - prev.t < WINDOW_MS &&
      Math.hypot(e.clientX - prev.x, e.clientY - prev.y) < SLOP_PX;

    if (near) {
      last.current = null;
      router.push("/admin");
      return;
    }
    last.current = { t: now, x: e.clientX, y: e.clientY };
  }

  return (
    <span
      onPointerUp={onPointerUp}
      /* Suppress the browser's own double-tap-to-zoom so the second tap
         reaches us instead of being consumed as a zoom gesture. */
      style={{ touchAction: "manipulation" }}
      className={className}
      /* Intentionally not a button and not focusable: this is a concealed
         entry point, and announcing it in the tab order or to screen readers
         would defeat the purpose. /admin is reachable directly by URL, and it
         is the gate — not this trigger — that enforces access. */
      aria-hidden="true"
    >
      {children}
    </span>
  );
}
