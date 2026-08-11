"use client";
import Image, { ImageProps } from "next/image";
import { useEffect, useState } from "react";

/*
 * SafeImage — next/image that degrades instead of taking the page down.
 *
 * THE BUG THIS FIXES
 * next/image treats an unreachable remote host as fatal: /_next/image returns
 * 500, the component throws during render, and the nearest error boundary
 * swallows the whole subtree. For a decorative blog thumbnail that is wildly
 * disproportionate — clicking a post rendered the global "Something went
 * wrong!" screen because one CDN image could not be proxied.
 *
 * Two independent failure modes are covered:
 *  1. onError — the optimizer answered non-2xx (host down, blocked, 404).
 *     We retry once with `unoptimized`, which bypasses /_next/image entirely
 *     and lets the browser fetch the origin URL directly. That alone rescues
 *     every "optimizer can't reach the host" case.
 *  2. Both attempts failed — render a neutral placeholder rather than a
 *     broken-image glyph, and keep the alt text for assistive tech.
 *
 * `key` is reset with the src so a carousel reusing this component for a new
 * item starts from a clean state instead of inheriting the previous failure.
 */
type SafeImageProps = ImageProps & { src: string };

export default function SafeImage({ src, alt, className, ...rest }: SafeImageProps) {
  const [stage, setStage] = useState<"optimized" | "raw" | "failed">("optimized");

  // A new src is a new subject: clear any sticky failure from the previous one.
  useEffect(() => setStage("optimized"), [src]);

  if (stage === "failed") {
    return (
      <div
        role="img"
        aria-label={typeof alt === "string" ? alt : undefined}
        className={`flex h-full w-full items-center justify-center bg-ink/10 ${className ?? ""}`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-8 w-8 opacity-30"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    <Image
      {...rest}
      key={`${src}-${stage}`}
      src={src}
      alt={alt}
      className={className}
      // Skip the optimizer on the retry so the browser hits the origin directly.
      unoptimized={stage === "raw"}
      onError={() => setStage((s) => (s === "optimized" ? "raw" : "failed"))}
    />
  );
}
