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
 * TWO portrait assets, cut from one master — this is what heynesh does.
 *
 * Their desktop figure renders full-height at ~33vw wide, which under
 * `object-fit: contain` means the ASSET's own ratio is ~0.716. Their mobile
 * wrap clamps imply ~0.494. Those cannot be the same file: the desktop asset is
 * a head-and-torso crop, the mobile one keeps the long faded tail.
 *
 * Serving one file to both is what forced the earlier compromises — either the
 * desktop figure was a thin sliver (fitting a 0.49 asset into a 100vh stage) or
 * mobile lost its rhythm (cropping the asset to suit desktop). Two crops from
 * one master removes the conflict entirely, and `cover`/hand-tuned masks are no
 * longer needed to hide the mismatch.
 */
export const HERO_PORTRAIT = {
  /* 1009x1409, ratio 0.7161 — top 69% of the master, bottom cropped away.
     Matches heynesh's measured desktop ratio (~0.716). */
  desktop: {
    src: "/hero-portrait-desktop-1050.webp",
    srcSet:
      "/hero-portrait-desktop-700.webp 700w, /hero-portrait-desktop-1050.webp 1050w",
    sizes: "46vw",
    ratio: 1009 / 1409,
  },
  /* 1009x2039, ratio 0.4949 — the full InShot export, only its transparent
     margins trimmed. The long bottom is the fade heynesh paints into their own
     mobile portrait; it is within 0.002 of the 0.4940 implied by their mobile
     wrap clamps, which is why the mobile rhythm only works with this shape. */
  mobile: {
    src: "/hero-portrait-1140.webp",
    srcSet: "/hero-portrait-760.webp 760w, /hero-portrait-1140.webp 1140w",
    sizes: "100vw",
    ratio: 1009 / 2039,
  },
  alt: "Waqas ul Haq Qureshi",
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
