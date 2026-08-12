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
  /* 1009x2039, ratio 0.4949.

     This is the InShot export with only its fully-transparent margins trimmed.
     An earlier pass cropped the bottom third off as an outpainting artifact —
     that was wrong twice over. It is the fade heynesh paints into their own
     mobile asset, and it is what makes the ratio 0.4949, which is within 0.002
     of the 0.4940 implied by heynesh's mobile wrap clamps. Their whole mobile
     rhythm (head high, cards beside the jaw, copy below the shoulders) is
     authored for an asset of exactly this shape, so cropping it broke the
     rhythm no matter how the CSS was retuned. */
  ratio: 1009 / 2039,
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
