"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useDockGenie } from "../hooks/useDockGenie";
import "./navbar.css";

/*
 * Primary navigation — bottom-center floating dock.
 *
 * PLACEMENT: unchanged from the original (fixed, bottom-center, z-50). The
 * left sidebar port is removed — only the APPEARANCE and BEHAVIOUR are
 * re-skinned to heynesh.com's chrome:
 *
 *   - the dock sits on a glass pane BRIGHTER than the page canvas
 *     (--glass-pane #dfdece vs --canvas #d5cfbe) with the source's
 *     backdrop-filter: blur(15px) + 1px #fff3 hairline (source: .nav-menu-bg)
 *   - each item rides its own chip layer (source: .nav-item-bg #ebeada),
 *     which is the element that animates on hover — not the text
 *   - each item carries a leading icon (source: .nav-item-icon, order:-9999)
 *   - hover → --sand #c9c8ba (source: .nav-email-item:hover)
 *     active → --accent #ffff23 (source: .about-card-button:hover)
 *   - the CTA is the source's yellow .nav-button
 *
 * The mix-blend-difference trick is gone: the dock now has a real surface, so
 * legibility comes from the pane itself rather than inverting the backdrop.
 *
 * A11Y (kept from the previous pass): real nav > ul > li > a, aria-current
 * synced by an IntersectionObserver scroll-spy, arrow/Home/End roving focus,
 * visible focus rings, 44px hit targets.
 *
 * GENIE MINIMISE: while the projects section owns the viewport the dock
 * shrinks to a pill so it stops covering that section's controls. Hovering,
 * focusing or tapping the pill restores it immediately — the collapsed state
 * is a courtesy, never a lock-out. See useDockGenie for the perf rationale.
 */

type IconKey = "home" | "work" | "about" | "contact";

const NAV_ITEMS: { href: string; id: IconKey; label: string }[] = [
  { href: "#home", id: "home", label: "Home" },
  { href: "#work", id: "work", label: "Work" },
  { href: "#about", id: "about", label: "About" },
  { href: "#contact", id: "contact", label: "Contact" },
];

/* Source uses small line-icons ahead of each label (.nav-item-icon). */
const ICONS: Record<IconKey, React.ReactNode> = {
  home: <path d="M3 9.5 10 4l7 5.5V16a1 1 0 0 1-1 1h-3.5v-4.5h-5V17H4a1 1 0 0 1-1-1V9.5Z" />,
  work: (
    <>
      <rect x="2.5" y="6" width="15" height="10.5" rx="1.5" />
      <path d="M7 6V4.75A1.25 1.25 0 0 1 8.25 3.5h3.5A1.25 1.25 0 0 1 13 4.75V6" />
    </>
  ),
  about: (
    <>
      <circle cx="10" cy="7" r="3" />
      <path d="M4 16.5a6 6 0 0 1 12 0" />
    </>
  ),
  contact: (
    <>
      <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" />
      <path d="m3 6 7 5 7-5" />
    </>
  ),
};

const RESUME_URL = process.env.NEXT_PUBLIC_RESUME_URL ?? "";

const NavBar = () => {
  const [active, setActive] = useState<string>("home");
  const listRef = useRef<HTMLUListElement>(null);

  /* Collapse while #work owns the screen. */
  const minimized = useDockGenie("work");
  /* A deliberate peek overrides the collapse. Kept separate from `minimized`
     so leaving the dock returns to whatever the scroll position dictates,
     rather than latching open. */
  const [peek, setPeek] = useState(false);
  const collapsed = minimized && !peek;

  /* Any in-dock navigation must un-collapse first, otherwise the click target
     the user is aiming at moves out from under them mid-gesture. */
  useEffect(() => {
    if (!minimized) setPeek(false);
  }, [minimized]);

  /*
   * `inert` on the collapsed content: it is visually scaled to nothing, so its
   * links must also leave the tab order and the a11y tree — otherwise Tab
   * lands on an invisible control.
   *
   * Set imperatively because the installed @types/react (18) predates the
   * inert prop, and React 19 is what actually runs. Touching the DOM property
   * directly works on both and needs no cast.
   */
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = contentRef.current;
    if (el) el.inert = collapsed;
  }, [collapsed]);

  /* Scroll-spy: one observer, no scroll handler. */
  useEffect(() => {
    const sections = NAV_ITEMS.map((i) => document.getElementById(i.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (!sections.length) return;

    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(
            entry.target.id,
            entry.isIntersecting ? entry.intersectionRatio : 0
          );
        }
        let bestId = "";
        let best = 0;
        ratios.forEach((r, id) => {
          if (r > best) {
            best = r;
            bestId = id;
          }
        });
        if (bestId) setActive(bestId);
      },
      { threshold: [0.15, 0.35, 0.6, 0.85], rootMargin: "-10% 0px -35% 0px" }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const handleScroll = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    id: string
  ) => {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    setActive(id);

    const hadTabIndex = target.hasAttribute("tabindex");
    if (!hadTabIndex) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    if (!hadTabIndex) {
      target.addEventListener("blur", () => target.removeAttribute("tabindex"), {
        once: true,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(e.key)) return;
    const links = Array.from(
      listRef.current?.querySelectorAll<HTMLAnchorElement>("a[data-nav-link]") ?? []
    );
    const i = links.findIndex((l) => l === document.activeElement);
    if (i === -1) return;
    e.preventDefault();
    const next =
      e.key === "ArrowRight"
        ? (i + 1) % links.length
        : e.key === "ArrowLeft"
        ? (i - 1 + links.length) % links.length
        : e.key === "Home"
        ? 0
        : links.length - 1;
    links[next].focus();
  };

  return (
    <nav
      aria-label="Primary"
      className="nm-dock"
      data-collapsed={collapsed}
      onPointerEnter={() => setPeek(true)}
      onPointerLeave={() => setPeek(false)}
      /* Focus entering the dock (keyboard tabbing) must expand it too — a
         collapsed dock with a focused-but-invisible link is a keyboard trap. */
      onFocusCapture={() => setPeek(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPeek(false);
        }
      }}
    >
      {/*
       * The collapsed handle. Rendered always (not conditionally) so the
       * genie is a pure CSS cross-fade between two stable layers — mounting a
       * node mid-transition would cause a layout pass at the worst moment.
       * aria-hidden + inert while expanded so it never reaches the a11y tree
       * or the tab order as a duplicate control.
       */}
      <button
        type="button"
        className="nm-dock__handle"
        aria-hidden={!collapsed}
        tabIndex={-1}
        onClick={() => setPeek(true)}
      >
        <span className="nm-dock__handle-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="nm-dock__handle-label">Menu</span>
      </button>

      {/* Source .nav-menu-bg — the glass pane the whole dock rides on */}
      <span className="nm-dock__bg" aria-hidden="true" />

      {/* Everything that collapses, in one layer: the genie animates this
          single node rather than each child, so the browser composites one
          transform instead of N. */}
      <div className="nm-dock__content" ref={contentRef}>
      <ul className="nm-dock__list" role="list" ref={listRef} onKeyDown={handleKeyDown}>
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id} className="nm-dock__item">
              {/* Source .nav-item-bg — the chip that animates, not the text */}
              <span className="nm-dock__chip" aria-hidden="true" />
              <a
                href={item.href}
                data-nav-link
                onClick={(e) => handleScroll(e, item.id)}
                aria-current={isActive ? "page" : undefined}
                className="nm-dock__link"
              >
                <span className="nm-dock__icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {ICONS[item.id]}
                  </svg>
                </span>
                <span className="nm-dock__label">{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>

      <span className="nm-dock__sep" aria-hidden="true" />

      {RESUME_URL ? (
        <Link
          href={RESUME_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="nm-dock__cta"
        >
          Resume
        </Link>
      ) : (
        <a
          href="#contact"
          onClick={(e) => handleScroll(e, "contact")}
          className="nm-dock__cta"
        >
          Book a Call
        </a>
      )}
      </div>
    </nav>
  );
};

export default NavBar;
