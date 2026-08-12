import { useEffect, useState, type CSSProperties } from "react";
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

/* Shipped portrait: a 1689x1920 alpha cutout whose subject bleeds off the
   bottom edge, emitted at two widths from one master. The ratio is exported to
   CSS so the layout box is reserved before the bitmap decodes. */
/* Mean advance of a capital in "Tr 3 A" at font-size:100, measured from the
   round-three overflow (the text painted at 125.8% of a 62-unit/char box, so
   the true advance is 62 x 1.258). It only has to be CLOSE: textLength absorbs
   the remainder exactly. Its job is to keep that correction small enough not to
   visibly distort the glyphs. */
const GLYPH_ADVANCE = 78;

const BUNDLED_PORTRAIT = {
  src: "/hero-waqas-1400.webp",
  srcSet: "/hero-waqas-900.webp 900w, /hero-waqas-1400.webp 1400w",
  ratio: 1689 / 1920,
};

const Hero = ({ content }: { content?: HeroContent }) => {
  /* Fall back to defaults so the component still renders standalone (e.g. in
     isolation or before any admin save has happened). */
  const HERO_COPY = content ?? DEFAULT_HERO;
  const markChars = Math.max(HERO_COPY.brandMark.trim().length, 1);
  /* The shipped portrait is emitted at two widths. Serving the 1400w file to a
     phone wastes ~43KB on the critical path, so a srcSet lets the browser pick
     — but ONLY for the bundled asset: an admin-uploaded image exists at exactly
     one width, and advertising widths that do not exist would have the browser
     request 404s. Hence the identity check rather than string interpolation. */
  const isBundledPortrait = HERO_COPY.profileImg === BUNDLED_PORTRAIT.src;
  const HERO_ASSETS = {
    profileImg: HERO_COPY.profileImg,
    profileImgAlt: HERO_COPY.profileImgAlt,
    srcSet: isBundledPortrait ? BUNDLED_PORTRAIT.srcSet : undefined,
    /* Mirrors the CSS: full-bleed under 767px, ~40vw above it. */
    sizes: isBundledPortrait ? "(max-width: 767px) 100vw, 40vw" : undefined,
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
      /* Only the bundled portrait's ratio is known at build time. An uploaded
         image keeps the CSS default rather than asserting a wrong shape. */
      style={
        isBundledPortrait
          ? ({ "--portrait-ratio": BUNDLED_PORTRAIT.ratio } as CSSProperties)
          : undefined
      }
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
            <div
              className="nesh-logo"
              style={
                {
                  "--mark-chars": markChars,
                  /* The box must be exactly as tall as the SVG paints, or it
                     reserves dead space that pushes everything below it down.
                     Both derive from the same viewBox, so they cannot drift. */
                  "--mark-ratio": (markChars * GLYPH_ADVANCE) / 100,
                } as React.CSSProperties
              }
            >
              {/*
               * The source ships an INLINE SVG wordmark, which scales to its
               * container for free. Rendering live text instead means the
               * width depends on the character count: at font-size:24vw the
               * source's 4-letter "NESH" measures ~70vw, but a 5-letter mark
               * measures ~97vw and overflows the 94.44vw box — the wordmark
               * ran off the right edge.
               *
               * Fix: wrap the text in an SVG with a viewBox and
               * preserveAspectRatio, so the browser scales the glyphs to the
               * available width no matter how many characters there are. This
               * matches how the source behaves rather than how it is authored.
               */}
              {/*
               * viewBox + textLength: the renderer fits the glyphs to exactly
               * the viewBox width whatever the name is, so nothing can overflow
               * regardless of the font's real metrics.
               *
               * Two earlier attempts failed here. Live text at font-size:24vw
               * overflowed once the name grew past 4 characters. Deriving the
               * viewBox from the character count then used an ESTIMATED glyph
               * advance that was ~20% low, so the text painted at 126% of the
               * box and spilled past both edges.
               *
               * The third attempt fixed the overflow but introduced a subtler
               * bug: a CONSTANT 1000-unit viewBox meant textLength stretched
               * every name to the same width, so the shorter the name the more
               * the letters were smeared sideways — "WAQAS" rendered at 2.56x
               * its natural width. Scaling the viewBox with the character count
               * instead keeps textLength a no-op-sized correction (it only
               * absorbs the few-percent error between the estimate and the real
               * metrics) rather than a 2-3x distortion, so the glyphs keep their
               * designed proportions at any length.
               */}
              <svg
                className="nesh-logo-svg"
                viewBox={`0 0 ${markChars * GLYPH_ADVANCE} 100`}
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label={HERO_COPY.brandMark}
              >
                <text
                  x={(markChars * GLYPH_ADVANCE) / 2}
                  y="78"
                  textAnchor="middle"
                  className="nesh-logo-text"
                  textLength={markChars * GLYPH_ADVANCE}
                  lengthAdjust="spacingAndGlyphs"
                >
                  {HERO_COPY.brandMark}
                </text>
              </svg>
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
            srcSet={HERO_ASSETS.srcSet}
            sizes={HERO_ASSETS.sizes}
            alt={HERO_ASSETS.profileImgAlt}
            className="hero-profile-img"
            loading="eager"
            decoding="async"
            fetchPriority="high"
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
            srcSet={HERO_ASSETS.srcSet}
            sizes={HERO_ASSETS.sizes}
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
