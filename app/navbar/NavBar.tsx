"use client";
import Link from "next/link";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

/*
 * Primary navigation dock — fully transparent composite.
 *
 * - No background fill, no border, no blur: it overlays the Hero and every
 *   section with zero background clipping.
 * - `mix-blend-difference` (with white text) automatically inverts against
 *   whatever is beneath it (beige canvas → dark slate; dark Work panel →
 *   near-white), so legibility never depends on the section behind it.
 * - Legacy blobity custom-cursor hooks removed; native pointer cursor on
 *   links/buttons (see base rules in globals.css).
 * - CSS micro-interactions preserved: underline sweep + 1px lift on hover.
 */
const NavBar = () => {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const href = e.currentTarget.href;
    const targetId = href.replace(/.*#/, "");
    const elem = document.getElementById(targetId);
    elem?.scrollIntoView({ behavior: "smooth" });
  };

  const linkClass =
    "group relative px-3 py-2 font-display text-[12px] font-medium uppercase leading-none tracking-[0.08em] text-white transition-transform duration-300 hover:-translate-y-px sm:px-4 sm:text-[14px] cursor-pointer";

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-6 left-0 right-0 z-50 mx-auto flex w-fit max-w-[calc(100vw-2rem)] items-center justify-center gap-1 bg-transparent mix-blend-difference sm:bottom-8"
    >
      <Link
        href=""
        aria-label="Open my resume"
        className="group relative flex items-center px-2 py-2 text-white transition-transform duration-300 hover:-translate-y-px sm:px-3"
      >
        <FontAwesomeIcon icon={faFilePdf} className="text-[16px]" />
      </Link>

      <span
        className="mx-1 block h-4 w-px bg-white/60"
        aria-hidden="true"
      />

      {[
        { href: "#home", label: "Home" },
        { href: "#work", label: "Work" },
        { href: "#about", label: "About" },
        { href: "#contact", label: "Contact" },
      ].map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={handleScroll}
          aria-label={`Scroll to ${item.label} Section`}
          className={linkClass}
        >
          {item.label}
          {/* underline sweep — pure CSS micro-interaction, kept */}
          <span
            className="absolute inset-x-3 -bottom-0.5 block h-px origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100 sm:inset-x-4"
            aria-hidden="true"
          />
        </Link>
      ))}
    </nav>
  );
};

export default NavBar;
