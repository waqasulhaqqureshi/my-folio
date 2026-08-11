/*
 * Local video asset manifest (Phase 2).
 *
 * Source of truth for the Work grid's motion layer. Assets were ingested from
 * the repo's `./new` drop-folder and normalised into `public/videos/` as
 * `work-01…06.webm` (the original filenames contained em-dashes and `®`,
 * which are hostile to URL encoding and CDN cache keys).
 *
 * INTRINSIC DIMENSIONS ARE MANDATORY, NOT DECORATIVE:
 * every asset is 778×1100 (portrait, ratio ≈ 0.7073). The grid reserves the
 * box via `aspect-ratio` computed from these numbers, so the media frame has
 * final geometry on first paint — before a single byte of video is fetched.
 * That is what keeps CLS at 0 while the loader is deliberately lazy.
 */
export type WorkMedia = {
  src: string;
  /** Poster still shown until the video decodes; also the LCP-safe fallback. */
  poster: string;
  width: number;
  height: number;
};

export const WORK_MEDIA_RATIO = 778 / 1100;

export const workMedia: WorkMedia[] = [
  { src: "/videos/work-01.webm", poster: "/projects/odunsi.png", width: 778, height: 1100 },
  { src: "/videos/work-02.webm", poster: "/projects/interlock-new.png", width: 778, height: 1100 },
  { src: "/videos/work-03.webm", poster: "/projects/synthetix.png", width: 778, height: 1100 },
  { src: "/videos/work-04.webm", poster: "/projects/propellent-new.png", width: 778, height: 1100 },
  { src: "/videos/work-05.webm", poster: "/projects/flixify-new.png", width: 778, height: 1100 },
  { src: "/videos/work-06.webm", poster: "/projects/crown.webp", width: 778, height: 1100 },
];

/** Deterministic media pairing so SSR and client markup never diverge. */
export const mediaForIndex = (i: number): WorkMedia =>
  workMedia[i % workMedia.length];
