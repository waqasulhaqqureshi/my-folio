/*
 * Shared hero content shape.
 *
 * Kept separate from heroContent.ts because that module is `server-only` (it
 * touches fs). Client components need the TYPE but must never pull in the
 * module — so the contract lives here, where both sides can import it.
 */
export type HeroContent = {
  brandMark: string;
  leftText: string;
  headingLines: string[];
  ctaPrimary: string;
  ctaSecondary: string;
  rightText: string;
  projectsStat: string;
  projectsLabel: string;
  yearsStat: number;
  yearsLabelLines: string[];
  skills: string[];
  profileImg: string;
  profileImgAlt: string;
};

export const DEFAULT_HERO: HeroContent = {
  brandMark: "WAQAS",
  leftText: "The Webflow Expert. That's Nenad.",
  /* Empty by default — the headline is optional and the buttons below it
     were removed, so the hero leads with the wordmark and the portrait. */
  headingLines: [],
  ctaPrimary: "Book a Call",
  ctaSecondary: "About Me",
  rightText:
    "Working closely with your team to deliver Webflow builds that merge creativity, technical excellence, and long-term value.",
  projectsStat: "80+",
  projectsLabel: "Projects",
  yearsStat: 7,
  yearsLabelLines: ["Years of", "experience"],
  skills: ["Creative", "Reliable", "Strategist", "Builder", "Efficient"],
  /* Local asset, not the reference site's CDN: /_next/image cannot proxy remote
     URLs in this sandbox, and the hero portrait is the LCP element — it must
     not depend on a third-party origin. */
  profileImg: "/hero-waqas-1400.webp",
  profileImgAlt: "Waqas ul Haq Qureshi",
};
