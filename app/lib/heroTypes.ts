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
/*
 * ONE portrait for every breakpoint.
 *
 * The previous two-asset arrangement (a 0.4949 full-length figure for phones,
 * a 0.7161 crop for desktop) existed only to reconcile two incompatible
 * demands: desktop wanted a wide head-and-torso shape, mobile wanted a tall
 * figure with room for copy underneath. `hero_waqas.png` removes the conflict
 * at the source -- it is already a tight head-and-shoulders cutout at 0.8805,
 * which is close enough to square that the SAME file composes correctly in a
 * 100vh desktop stage and in a phone column.
 *
 * Properties that matter to the layout, measured off the bitmap:
 *   - true alpha cutout (46% fully opaque / 51% fully transparent), so it needs
 *     no bottom fade mask at any breakpoint -- nothing to dissolve;
 *   - the torso runs OPAQUE to the final row (row 1916 is 99.6% covered), so
 *     the image bottom IS the figure bottom and can sit flush on the hero's
 *     bottom edge with no gap and no visible cut;
 *   - head top 1.7%, neck 57.9%, shoulders flare from 59.4% of the height.
 */
export const HERO_PORTRAIT = {
  src: "/hero-waqas-1140.webp",
  srcSet:
    "/hero-waqas-760.webp 760w, /hero-waqas-1140.webp 1140w, /hero-waqas-1690.webp 1690w",
  sizes: "(max-width: 767px) 100vw, 46vw",
  alt: "Waqas ul Haq Qureshi",
  /* 1688x1917 */
  ratio: 1688 / 1917,
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
  /* The headline remains OPTIONAL (clearing it in the admin panel still hides
     the <h1> entirely), but it ships populated: an empty default meant the hero
     rendered with no H1 at all, which is both a missing-content bug and an
     accessibility problem — the page had no top-level heading. */
  headingLines: ["Webflow,", "Applied", "Differently."],
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
