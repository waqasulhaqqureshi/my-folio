"use client";
import { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";

/*
 * CountUp — the hero's stat-counter pattern, promoted to a shared primitive
 * ("living signal" motion: numbers that count up when they enter view).
 *
 * <CountUp target={7} />                      → 0…7
 * <CountUp target={5} pad={2} suffix="+" />   → 00…05+
 */
type CountUpProps = {
  target: number;
  /** zero-pad the rendered number to N digits (default 0) */
  pad?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
};

const CountUp = ({
  target,
  pad = 0,
  suffix = "",
  prefix = "",
  duration = 1.2,
  className,
}: CountUpProps) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(wrapRef, { once: true, margin: "-10% 0px" });

  useEffect(() => {
    if (!inView || !spanRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    if (reduced) {
      spanRef.current.textContent =
        prefix + String(target).padStart(pad, "0") + suffix;
      return;
    }
    const controls = animate(0, target, {
      duration,
      ease: [0.22, 0.61, 0.36, 1],
      onUpdate: (v) => {
        if (spanRef.current) {
          spanRef.current.textContent =
            prefix + String(Math.round(v)).padStart(pad, "0") + suffix;
        }
      },
    });
    return () => controls.stop();
  }, [inView, target, pad, suffix, prefix, duration]);

  return (
    <span ref={wrapRef} className={className} aria-label={`${prefix}${target}${suffix}`}>
      <span ref={spanRef} aria-hidden="true">
        {prefix}
        {String(0).padStart(pad, "0")}
        {suffix}
      </span>
    </span>
  );
};

export default CountUp;
