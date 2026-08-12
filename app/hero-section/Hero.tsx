import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import CountUp from "../animations/CountUp";
import { DEFAULT_HERO, type HeroContent } from "../lib/heroTypes";
import "./hero.css";

/* ============================================================================
 * heynesh.com — Hero Section (faithful React/Next.js port)
 * ----------------------------------------------------------------------------
 * DOM structure, class names, typography, spacing and asset integration are
 * extracted 1:1 from the live source (see hero.css header for provenance).
 *
 * Everything a human editor would want to personalise lives in these three
 * config objects — no need to touch the markup below.
 * ==========================================================================*/

/** Flip to true to restore the source's 300vh scroll-pinned hero (paired with
 *  the `padding-bottom: 180vh` source rule in hero.css). OFF by default so
 *  your About/Work sections keep their natural document flow. */
const ENABLE_HERO_PIN = false;


/* Nav labels stay hard-coded: they map to section anchors below, so they are
   structural rather than editorial content. Everything the admin panel can
   change now arrives via the `content` prop. */
const HERO_NAV = {
  navLeft: ["home", "about me", "projects"],
  navRight: ["what you get", "services", "clients", "faq"],
};

/** Map the source hero's nav labels onto this site's section anchors. */
const HERO_LINKS: Record<string, string> = {
  home: "#home",
  "about me": "#about",
  projects: "#work",
  "what you get": "#work",
  services: "#contact",
  clients: "#reviews",
  faq: "#contact",
  "book a call": "#contact",
  "about me cta": "#about",
};

/* -------------------------------------------------------------------------- */
/* Load-in choreography (approximates the source's Webflow IX load sequence):  */
/* pre-states from the source stylesheet (cards/cta start at opacity 0) become */
/* framer-motion initial values that settle into the exact "at rest" state.    */
/* -------------------------------------------------------------------------- */
const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const logoAnim = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, ease: EASE, delay: 0.15 },
};

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: EASE, delay },
});

const lineReveal = (index: number) => ({
  initial: { y: "110%" },
  animate: { y: "0%" },
  transition: { duration: 0.8, ease: EASE, delay: 0.35 + index * 0.09 },
});

const cardPop = (delay: number) => ({
  initial: { opacity: 0, y: 32, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.7, ease: EASE, delay },
});

/** Animated 0 → N stat (shared primitive — the hero's count-up pattern). */
const ExperienceNumber = ({ target }: { target: number }) => {
  return (
    <div className="experience-number-wrap">
      <div className="experience-number">
        <CountUp target={target} />
      </div>
    </div>
  );
};

/** Yellow marker used by .hero-card-3-icon in the source skill chips. */
const SkillChipIcon = () => (
  <span className="hero-card-3-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

/** Stylised Webflow "W" mark (source renders the brand glyph in --yellow). */
const WebflowIcon = () => (
  <span className="hero-webflow-icon" aria-hidden="true">
    <svg viewBox="0 0 64 40" width="100%" height="100%" fill="currentColor">
      <path d="M0 4h10.4l6.4 25.5L24.5 4h7.6l7.7 25.5L46.2 4H56.6L46 36h-7.7L30.7 12.4 23.4 36h-7.7L8.6 16.6C5.9 8.3 2.7 5.4 0 4z" />
    </svg>
  </span>
);

const Hero = ({ content }: { content?: HeroContent }) => {
  /* Fall back to defaults so the component still renders standalone (e.g. in
     isolation or before any admin save has happened). */
  const HERO_COPY = content ?? DEFAULT_HERO;
  const HERO_ASSETS = {
    profileImg: HERO_COPY.profileImg,
    profileImgAlt: HERO_COPY.profileImgAlt,
  };
  /* Ghost-target FLIP (heynesh.com technique): the wordmark mounts in an
   * mid-viewport "intro" slot and morphs into its measured resting position
   * the moment the PreLoader's exit wipe starts. `nm:intro-exit` drives it;
   * a 4.8s fallback guarantees the final state even if the event is missed. */
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const settle = () => setSettled(true);
    window.addEventListener("nm:intro-exit", settle);
    const fallback = window.setTimeout(settle, 4800);
    return () => {
      window.removeEventListener("nm:intro-exit", settle);
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <motion.section
      id="home"
      className={`hero${ENABLE_HERO_PIN ? " hero--pinned" : ""}`}
      initial="initial"
      animate="animate"
      aria-label="Hero — heynesh.com port"
    >
      {/* ================= .hero-sticky — 100vh sticky frame ================= */}
      <div className="hero-sticky">
        {/* ---------- .nesh-logo-preload — giant yellow wordmark + nav row --- */}
        <motion.div
          className={`nesh-logo-preload${settled ? " is-settled" : " is-intro"}`}
          {...logoAnim}
        >
          {/* FLIP target: `layout` animates from the intro slot (margin-top:
              22vh, see hero.css) into the source-faithful resting position */}
          <motion.div
            className="nesh-logo-wrap"
            layout
            transition={{ duration: 0.9, ease: EASE }}
          >
            <div className="nesh-logo">
              {/* Source ships an inline SVG wordmark; text rendering uses the
                  same "Tr 3 A" Bold face and the same 3.5/3.8 aspect frame. */}
              <span className="nesh-logo-svg">{HERO_COPY.brandMark}</span>
              <span className="nesh-copyright-wrap" aria-hidden="true">
                <svg
                  className="nesh-copyright-icon"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="6.4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M6.2 9.8V6.2h3.1"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6.2 6.2 9.8 9.8"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </div>
          </motion.div>

          {/* ------- .hero-navigation-wrap — in-hero top link row ---------- */}
          {/* Revealed only once the wordmark has settled into its slot        */}
          <motion.nav
            className="hero-navigation-wrap"
            aria-label="Hero quick links"
            initial={false}
            animate={{ opacity: settled ? 1 : 0, y: settled ? 0 : 8 }}
            transition={{ duration: 0.5, ease: EASE, delay: settled ? 0.25 : 0 }}
          >
            <div className="hero-links-ghost-wrapper">
              {HERO_NAV.navLeft.map((item, i) => (
                <span key={item} style={{ display: "contents" }}>
                  {i > 0 && <span className="hero-navigation-sep" />}
                  <Link
                    href={HERO_LINKS[item] ?? "#home"}
                    className="hero-navigation-link"
                  >
                    {item}
                  </Link>
                </span>
              ))}
            </div>
            <div className="hero-links-ghost-wrapper is-hero-right-nav-item">
              {HERO_NAV.navRight.map((item, i) => (
                <span key={item} style={{ display: "contents" }}>
                  {i > 0 && <span className="hero-navigation-sep" />}
                  <Link
                    href={HERO_LINKS[item] ?? "#home"}
                    className="hero-navigation-link"
                  >
                    {item}
                  </Link>
                </span>
              ))}
            </div>
          </motion.nav>
        </motion.div>

        {/* ---------- .profile-img-wrap — the "Nesh" portrait layer --------- */}
        {/* Source: position:fixed, 100vw x 100vh, z-index 10 (page-level).   */}
        {/* Contained absolutely here for strict component isolation.         */}
        <motion.div
          className="profile-img-wrap"
          initial={{ opacity: 0, y: "6%" }}
          animate={{ opacity: 1, y: "0%" }}
          transition={{ duration: 1, ease: EASE, delay: 0.25 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_ASSETS.profileImg}
            alt={HERO_ASSETS.profileImgAlt}
            className="hero-profile-img"
            loading="eager"
            decoding="async"
          />
        </motion.div>

        {/* ---------- .hero-container — bottom band, 93.06vw --------------- */}
        <div className="hero-container">
          {/* Left flank paragraph (source: width clamp(8rem,11vw,14rem)) */}
          <motion.div className="hero-left-text" {...fadeUp(0.55)}>
            <div className="line-mask">
              <span className="hero-line-text">{HERO_COPY.leftText}</span>
            </div>
          </motion.div>

          {/* Centre: heading + buttons (absolute bottom, full width) */}
          <div className="hero-content-layout">
            {/* The headline is optional: cleared in the admin panel it must
                vanish entirely, not leave an empty <h1> holding vertical space
                and an empty landmark in the a11y tree. */}
            {HERO_COPY.headingLines.length > 0 && (
              <h1 className="hero-heading">
                {HERO_COPY.headingLines.map((line, i) => (
                  <span className="line" key={line}>
                    <motion.span className="hero-line-text" {...lineReveal(i)}>
                      {line}
                    </motion.span>
                  </span>
                ))}
              </h1>
            )}

            <motion.div className="hero-buttons-wrap" {...fadeUp(0.75)}>
              {/* Source pre-state: .hero-cta-button starts at opacity:0 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <Link
                  href={HERO_LINKS["book a call"]}
                  className="hero-cta-button"
                  aria-label="BOOK A CALL"
                >
                  {HERO_COPY.ctaPrimary}
                </Link>
              </motion.div>
              <Link
                href={HERO_LINKS["about me cta"]}
                className="hero-button"
                aria-label="About Me"
              >
                {HERO_COPY.ctaSecondary}
              </Link>
            </motion.div>
          </div>

          {/* Right flank paragraph (source: width clamp(200px,24.64vw,420px)) */}
          <motion.div className="hero-right-text" {...fadeUp(0.65)}>
            <div className="line-mask">
              <span className="hero-line-text">{HERO_COPY.rightText}</span>
            </div>
          </motion.div>
        </div>

        {/* ---------- .mobile-hero-image-wrap — mobile portrait swap -------- */}
        <div className="mobile-hero-image-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_ASSETS.profileImg}
            alt={HERO_ASSETS.profileImgAlt}
            className="mobile-hero-image"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* ---------- .hero-cards-wrap — glass cards cluster ---------------- */}
        {/* Source: position:fixed, bottom 2.78%, z-index 30, contained here. */}
        <div className="hero-cards-wrap">
          <div className="hero-cards-left">
            {/* Card 2 — 80+ Projects */}
            <motion.div className="hero-card-2-wrap" {...cardPop(0.85)}>
              <div className="hero-card-2">
                <span className="hero-card-2-bg" aria-hidden="true" />
                <span className="hero-webflow-icon-wrap">
                  <WebflowIcon />
                </span>
                <div className="hero-c-projects-text-wrap">
                  <span className="hero-projects-number">
                    {HERO_COPY.projectsStat}
                  </span>
                  <span className="hero-webflow-projects-text">
                    {HERO_COPY.projectsLabel}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Card 1 — Years of experience (runtime counter → 7) */}
            <motion.div className="hero-card-1-wrap" {...cardPop(0.95)}>
              <div className="hero-card-1">
                <span className="experience-bg" aria-hidden="true" />
                <ExperienceNumber target={HERO_COPY.yearsStat} />
                <div className="experience-text-wrap">
                  {HERO_COPY.yearsLabelLines.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Card 3 — skill chips, floated top-right of the cluster */}
          <motion.div className="hero-card-3" {...cardPop(1.05)}>
            {HERO_COPY.skills.map((skill) => (
              <div className="hero-card-3-item" key={skill}>
                <SkillChipIcon />
                <span>{skill}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default Hero;
