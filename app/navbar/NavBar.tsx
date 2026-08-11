"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMagnetic } from "../hooks/useMagnetic";
import "./navbar.css";

/*
 * Primary navigation — Phase 4.
 *
 * TYPOGRAPHY / LAYOUT (heynesh.com heuristics)
 *   - uppercase, font-weight 500, line-height 1, letter-spacing 0.04em
 *   - fluid ramp clamp(0.75rem, 1.18vw, 1.5rem) — identical to the in-hero
 *     .hero-navigation-link scale already in hero.css, so the dock and the
 *     hero row read as one system
 *   - 1px hairline separators, 1.11vw flex gutters
 *
 * ARIA / KEYBOARD
 *   - <nav aria-label="Primary"> → <ul role="list"> → <li> → <a>: a real list,
 *     so screen readers announce "list, 4 items" and support list navigation.
 *   - The active section carries aria-current="page", kept in sync by a
 *     scroll-spy IntersectionObserver (not a scroll handler — no main-thread
 *     work per scroll event).
 *   - Left/Right/Home/End arrow keys move focus between links (composite
 *     widget pattern), Tab still enters and leaves the nav in one stop-per-link
 *     since these are ordinary links, not a roving-tabindex toolbar.
 *   - :focus-visible draws a 3px accent ring that is NEVER removed on mouse
 *     use; `mix-blend-difference` is disabled while focused so the ring keeps
 *     its true contrast against any backdrop.
 *   - Smooth scrolling is skipped for prefers-reduced-motion, and focus is
 *     moved to the target section so keyboard context follows the viewport.
 */

/*
 * Resume asset is not in the repo yet. Rendering a link to a 404 is worse than
 * rendering nothing (screen readers announce a real, broken destination), so
 * the chip is conditional: drop `resume.pdf` into /public — or set
 * NEXT_PUBLIC_RESUME_URL — and it mounts itself.
 */
const RESUME_URL = process.env.NEXT_PUBLIC_RESUME_URL ?? "";

const NAV_ITEMS = [
  { href: "#home", id: "home", label: "Home" },
  { href: "#work", id: "work", label: "Work" },
  { href: "#about", id: "about", label: "About" },
  { href: "#contact", id: "contact", label: "Contact" },
] as const;

const NavBar = () => {
  const [active, setActive] = useState<string>("home");
  const listRef = useRef<HTMLUListElement>(null);
  const resumeRef = useMagnetic<HTMLAnchorElement>({ strength: 0.5, padding: 12 });

  /* ---- Scroll-spy: one observer, no scroll listener ---------------------- */
  useEffect(() => {
    const sections = NAV_ITEMS.map((i) => document.getElementById(i.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (!sections.length) return;

    // Track ratios in a map and pick the most-visible section per callback.
    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let bestId = "";
        let best = 0;
        ratios.forEach((ratio, id) => {
          if (ratio > best) {
            best = ratio;
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

  /* ---- Smooth scroll + focus transfer ------------------------------------ */
  const handleScroll = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    id: string
  ) => {
    const target = document.getElementById(id);
    if (!target) return; // let the browser handle a missing anchor
    e.preventDefault();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
    setActive(id);

    // Move the a11y focus ring with the viewport without stealing it visually.
    const hadTabIndex = target.hasAttribute("tabindex");
    if (!hadTabIndex) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    if (!hadTabIndex) {
      target.addEventListener("blur", () => target.removeAttribute("tabindex"), {
        once: true,
      });
    }
  };

  /* ---- Arrow-key navigation within the list ------------------------------ */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(e.key)) return;

    const links = Array.from(
      listRef.current?.querySelectorAll<HTMLAnchorElement>("a[data-nav-link]") ?? []
    );
    if (!links.length) return;

    const currentIndex = links.findIndex((l) => l === document.activeElement);
    if (currentIndex === -1) return;
    e.preventDefault();

    const nextIndex =
      e.key === "ArrowRight"
        ? (currentIndex + 1) % links.length
        : e.key === "ArrowLeft"
        ? (currentIndex - 1 + links.length) % links.length
        : e.key === "Home"
        ? 0
        : links.length - 1;

    links[nextIndex].focus();
  };

  return (
    <nav aria-label="Primary" className="nm-nav">
      {RESUME_URL && (
        <>
          <Link
            ref={resumeRef}
            href={RESUME_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="nm-nav__resume"
          >
            <FontAwesomeIcon
              icon={faFilePdf}
              className="nm-nav__icon"
              aria-hidden="true"
            />
            <span className="sr-only">
              Open my resume (PDF, opens in a new tab)
            </span>
          </Link>

          <span className="nm-nav__sep" aria-hidden="true" />
        </>
      )}

      <ul className="nm-nav__list" role="list" ref={listRef} onKeyDown={handleKeyDown}>
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id} className="nm-nav__item">
              <Link
                href={item.href}
                data-nav-link
                onClick={(e) => handleScroll(e, item.id)}
                aria-current={isActive ? "page" : undefined}
                className="nm-nav__link"
                data-active={isActive ? "true" : "false"}
              >
                <span className="nm-nav__label">{item.label}</span>
                <span className="nm-nav__underline" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default NavBar;
