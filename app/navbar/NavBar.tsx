"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import "./navbar.css";

/*
 * Navigation — 1:1 structural port of heynesh.com's nav.
 *
 * The previous bottom-dock was the wrong object entirely. The source's nav is a
 * FIXED LEFT SIDEBAR, which is why every section on that site carries
 * `padding-left: 21vw`. Source DOM:
 *
 *   div.navigation                  fixed; left:1.39vw; top:0; bottom:0;
 *                                   width:18.54vw; height:100vh
 *     ├── div.nav-top-layout        (+ .nav-top-bg glass pane)
 *     │     └── .nav-top-item → .nav-logo (yellow wordmark) + .social-wrap
 *     ├── div.nav-stats-wrap        (+ .nav-stats-bg) → .nav-stats-card ×2
 *     ├── nav.nav-menu              (+ .nav-menu-bg) → .nav-menu-item ×N
 *     │     └── each: .nav-item-bg (chip) + .nav-item-icon + label + a.nav-link
 *     └── div.nav-button-wrap       → a.nav-button (yellow CTA)
 *
 * Menu items are this portfolio's own IA (Home / Work / About / Contact) in the
 * source's chrome — the source's own labels (what you get, faq…) map to
 * sections that don't exist here.
 *
 * A11Y (additive — the source itself is a div soup with `cursor:none`):
 *   - real <nav> → <ul> → <li> → <a>, aria-current on the active section
 *   - IntersectionObserver scroll-spy (no scroll handler)
 *   - Arrow/Home/End roving focus, visible :focus-visible ring
 *   - the source's decorative overlay <a.nav-link> is NOT reproduced as a second
 *     focusable node; the label anchor is the single tab stop.
 */

const NAV_ITEMS = [
  { href: "#home", id: "home", label: "Home" },
  { href: "#work", id: "work", label: "Work" },
  { href: "#about", id: "about", label: "About" },
  { href: "#contact", id: "contact", label: "Contact" },
] as const;

const SOCIALS = [
  {
    label: "GitHub",
    href: "https://github.com/waqasulhaqqureshi",
    path: "M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.8c.85 0 1.71.11 2.51.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10z",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/",
    path: "M6.94 5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0zM3.1 8.42h3.7V21H3.1V8.42zM9.2 8.42h3.54v1.72h.05c.49-.93 1.7-1.91 3.5-1.91 3.74 0 4.43 2.46 4.43 5.66V21h-3.7v-6.4c0-1.53-.03-3.5-2.13-3.5-2.13 0-2.46 1.66-2.46 3.38V21H9.2V8.42z",
  },
  {
    label: "X",
    href: "https://x.com/",
    path: "M18.9 2H22l-6.77 7.73L23.2 22h-6.24l-4.89-6.39L6.47 22H3.35l7.24-8.27L2.8 2h6.4l4.42 5.84L18.9 2zm-1.1 18.1h1.73L7.3 3.8H5.45L17.8 20.1z",
  },
];

const NavBar = () => {
  const [active, setActive] = useState<string>("home");
  const listRef = useRef<HTMLUListElement>(null);

  /* Scroll-spy: one observer, no scroll listener. */
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
    const keys = ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(e.key)) return;
    const links = Array.from(
      listRef.current?.querySelectorAll<HTMLAnchorElement>("a[data-nav-link]") ?? []
    );
    const i = links.findIndex((l) => l === document.activeElement);
    if (i === -1) return;
    e.preventDefault();
    const next =
      e.key === "ArrowDown" || e.key === "ArrowRight"
        ? (i + 1) % links.length
        : e.key === "ArrowUp" || e.key === "ArrowLeft"
        ? (i - 1 + links.length) % links.length
        : e.key === "Home"
        ? 0
        : links.length - 1;
    links[next].focus();
  };

  return (
    <div className="navigation">
      {/* ---- .nav-top-layout: wordmark + socials ---------------------------- */}
      <div className="nav-top-layout">
        <div className="nav-top-bg" aria-hidden="true" />
        <div className="nav-top-item">
          <Link href="#home" className="nav-logo" aria-label="Home">
            <span className="nav-logo-mark">WQ</span>
            <svg className="nesh-copyright-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="6.4" stroke="currentColor" strokeWidth="1.6" />
              <path d="M10.3 6.3a3 3 0 1 0 0 3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </Link>

          <ul className="social-wrap" role="list">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label={`${s.label} (opens in a new tab)`}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ---- .nav-stats-wrap ------------------------------------------------ */}
      <div className="nav-stats-wrap">
        <div className="nav-stats-bg" aria-hidden="true" />
        <div className="nav-stats-card">
          <span className="nav-experience-numb">9</span>
          <span className="nav-stats-label">Projects</span>
        </div>
        <span className="nav-stats-sep" aria-hidden="true" />
        <div className="nav-stats-card">
          <span className="nav-experience-numb">3</span>
          <span className="nav-stats-label">
            Years of
            <br />
            experience
          </span>
        </div>
      </div>

      {/* ---- .nav-menu ------------------------------------------------------ */}
      <nav className="nav-menu" aria-label="Primary">
        <div className="nav-menu-bg" aria-hidden="true" />
        <ul className="nav-menu-list" role="list" ref={listRef} onKeyDown={handleKeyDown}>
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id} className="nav-menu-item">
                <span className="nav-item-bg" aria-hidden="true" />
                <a
                  href={item.href}
                  data-nav-link
                  onClick={(e) => handleScroll(e, item.id)}
                  aria-current={isActive ? "page" : undefined}
                  className="nav-menu-link"
                >
                  <span className="nav-item-icon" aria-hidden="true">
                    <svg viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </span>
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ---- .nav-button-wrap ---------------------------------------------- */}
      <div className="nav-button-wrap">
        <a href="#contact" onClick={(e) => handleScroll(e, "contact")} className="nav-button">
          Book a Call
        </a>
      </div>
    </div>
  );
};

export default NavBar;
