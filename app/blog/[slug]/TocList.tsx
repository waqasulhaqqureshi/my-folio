"use client";

import { useEffect, useState } from "react";
import type { Heading } from "../../lib/posts";

/*
 * Contents rail with active-section highlighting.
 *
 * The active heading changes only at discrete boundaries, so this uses
 * IntersectionObserver rather than measuring in a scroll handler — the latter
 * would mean one getBoundingClientRect() per heading per frame, forcing
 * synchronous layout on every one.
 */
export default function TocList({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "");

  useEffect(() => {
    const targets = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    /*
     * rootMargin collapses the viewport to a thin band near the top, so only
     * the heading currently at the reading position qualifies. With the
     * default full-viewport root, every heading in a short section is
     * "intersecting" at once and the highlight jitters.
     */
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-10% 0px -75% 0px", threshold: 0 }
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav className="post-toc" aria-label="Table of contents">
      <p className="nm-eyebrow mb-4">Contents</p>
      <ul>
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              data-level={h.level}
              data-active={activeId === h.id}
              aria-current={activeId === h.id ? "location" : undefined}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
