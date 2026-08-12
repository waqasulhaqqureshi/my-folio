/*
 * Shared hero content shape.
 *
 * Kept separate from heroContent.ts because that module is `server-only` (it
 * touches fs). Client components need the TYPE but must never pull in the
 * module — so the contract lives here, where both sides can import it.
 */

/*
 * The hero portrait is LOCKED to the bundled asset and is deliberately NOT part
 * of HeroContent.
 *
 * Making it a constant rather than a validated-but-overridable field is what
 * makes the lock real: there is no field to persist, so a stale data file, a
 * hand-edited JSON, a replayed upload request or a crafted PUT body has nothing
 * to override. The type system then finds every read site for free.
 *
 * The two widths come from one master; the ratio is exported so the layout box
 * can be reserved before the bitmap decodes.
 */
export const HERO_PORTRAIT = {
  src: "/hero-portrait-1140.webp",
  srcSet: "/hero-portrait-760.webp 760w, /hero-portrait-1140.webp 1140w",
  sizes: "(max-width: 767px) 100vw, 46vw",
  alt: "Waqas ul Haq Qureshi",
  /* 976x1457. The source PNG was 1009x2048, but its bottom third was an
     outpainted artifact: below y=1480 the silhouette snapped to the full frame
     width and the alpha lost its margins (detected by the left/right edge of
     the cutout jumping to 0/1008 and staying there). Cropped to the real
     subject before encoding, so the hero never has to hide a smudge. */
  ratio: 976 / 1457,
} as const;

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
};
