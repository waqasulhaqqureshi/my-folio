/*
 * Project content contract + device media specs.
 *
 * Client-safe: the admin editor, the upload route and the public Work section
 * all import from here. Nothing in this file touches `fs`, so it can be pulled
 * into a client bundle (unlike projectContent.ts, which is server-only).
 */

export type Project = {
  /** Stable identity across reorders and renames. Never reused after delete. */
  id: string;
  name: string;
  description: string;
  technologies: string[];
  demo: string;
  /** Poster still shown behind the web video until playback starts. */
  image: string;
  /** Landscape capture for the tablet frame. */
  video: string;
  /**
   * Portrait capture for the phone frame. Empty string = fall back to
   * mobileImage, so a project without a phone recording is still valid.
   */
  mobileVideo: string;
  /** Portrait still, used as the phone poster and as the no-video fallback. */
  mobileImage: string;
  available: boolean;
};

/*
 * Frame specs.
 *
 * These aspect ratios are not arbitrary — they are what the CSS device frames
 * declare (.device-screen aspect-ratio). Uploading media of a different shape
 * means object-fit: cover crops it, so the upload route enforces the ratio and
 * the editor shows the requirement up front.
 *
 * TOLERANCE exists because real recordings land a pixel or two off: 778x1100
 * is 0.70727 while 704x1520 is 0.46316. A 3% band accepts an honest capture
 * and still rejects, say, a 16:9 clip dropped into the phone slot.
 */
export type DeviceSlot = "web" | "mobile";

export type MediaSpec = {
  label: string;
  /** width / height */
  ratio: number;
  /** The canonical size to record at, quoted to the user verbatim. */
  recommended: { width: number; height: number };
  /** Smallest acceptable width — below this the frame visibly softens. */
  minWidth: number;
  tolerance: number;
};

export const MEDIA_SPECS: Record<DeviceSlot, MediaSpec> = {
  web: {
    label: "Web (tablet frame)",
    ratio: 778 / 1100,
    recommended: { width: 778, height: 1100 },
    minWidth: 640,
    tolerance: 0.03,
  },
  mobile: {
    label: "Mobile (phone frame)",
    ratio: 704 / 1520,
    recommended: { width: 704, height: 1520 },
    minWidth: 480,
    tolerance: 0.03,
  },
};

/** Human-readable requirement string — reused by the editor and the API errors. */
export function specSummary(slot: DeviceSlot): string {
  const s = MEDIA_SPECS[slot];
  const pct = Math.round(s.tolerance * 100);
  return `${s.recommended.width}x${s.recommended.height} (aspect ratio ${s.ratio.toFixed(
    3
  )}, ±${pct}%), minimum width ${s.minWidth}px`;
}

/**
 * Ratio check with a relative tolerance.
 *
 * Compares ratios rather than exact pixels so any resolution of the right
 * shape is accepted — a 1556x2200 capture is as valid as 778x1100.
 */
export function checkDimensions(
  slot: DeviceSlot,
  width: number,
  height: number
): { ok: true } | { ok: false; reason: string } {
  const spec = MEDIA_SPECS[slot];
  if (width < spec.minWidth) {
    return {
      ok: false,
      reason: `${width}x${height} is too small — ${slot} media needs a width of at least ${spec.minWidth}px. Recommended: ${spec.recommended.width}x${spec.recommended.height}.`,
    };
  }
  const ratio = width / height;
  const drift = Math.abs(ratio - spec.ratio) / spec.ratio;
  if (drift > spec.tolerance) {
    return {
      ok: false,
      reason: `${width}x${height} has an aspect ratio of ${ratio.toFixed(
        3
      )}, but the ${slot} frame needs ${spec.ratio.toFixed(3)} (±${Math.round(
        spec.tolerance * 100
      )}%). It would be cropped. Recommended: ${spec.recommended.width}x${spec.recommended.height}.`,
    };
  }
  return { ok: true };
}

export const EMPTY_PROJECT: Omit<Project, "id"> = {
  name: "New project",
  description: "",
  technologies: [],
  demo: "",
  image: "",
  video: "",
  mobileVideo: "",
  mobileImage: "",
  available: true,
};

/* Seed roster — the projects that shipped with the site. Used when no
   data/projects.json exists yet, so a fresh clone renders a full section
   instead of an empty one, and the admin panel opens with real rows. */
export const DEFAULT_PROJECTS: Project[] = [
  {
    id: "p-1910",
    name: "1910.ai",
    description:
      "Pioneering small and large molecule therapeutics discovery by integrating multimodal data.",
    technologies: ["Components", "GSAP", "SEO"],
    demo: "https://www.1910.ai/",
    image: "/projects/synthetix.png",
    video: "/videos/web/work-01.webm",
    mobileVideo: "",
    mobileImage: "/projects/mobile/1910.webp",
    available: true,
  },
  {
    id: "p-semiconbio",
    name: "SemiconBio",
    description:
      "Fully realizing the promise of molecular electronics with the SemiconBio platform.",
    technologies: ["CMS", "API", "Motion"],
    demo: "https://www.semiconbio.com/",
    image: "/projects/interlock-new.png",
    video: "/videos/web/work-02.webm",
    mobileVideo: "",
    mobileImage: "/projects/mobile/semiconbio.webp",
    available: true,
  },
  {
    id: "p-happyring",
    name: "Happy Ring",
    description:
      "A health tracking ring that measures sleep, stress and recovery with clinical accuracy.",
    technologies: ["Interactions", "3D", "CMS"],
    demo: "https://www.happyring.com/",
    image: "/projects/odunsi.png",
    video: "/videos/web/work-03.webm",
    mobileVideo: "",
    mobileImage: "/projects/mobile/happyring.webp",
    available: true,
  },
  {
    id: "p-pssltd",
    name: "PSSLTD",
    description:
      "Industrial inspection services, presented with the clarity of a modern product site.",
    technologies: ["CMS", "SEO", "Forms"],
    demo: "https://www.pssltd.com/",
    image: "/projects/propellent-new.png",
    video: "/videos/web/work-04.webm",
    mobileVideo: "",
    mobileImage: "/projects/mobile/pssltd.webp",
    available: true,
  },
  {
    id: "p-lilipad",
    name: "Lilipad",
    description:
      "A children's digital library built to feel playful without sacrificing performance.",
    technologies: ["CMS", "Motion", "A11y"],
    demo: "https://www.lilipad.com/",
    image: "/projects/flixify-new.png",
    video: "/videos/web/work-05.webm",
    mobileVideo: "",
    mobileImage: "/projects/mobile/lilipad.webp",
    available: true,
  },
  {
    id: "p-omicron",
    name: "Omicron",
    description:
      "A web3 studio site where the interface itself demonstrates the craft on offer.",
    technologies: ["GSAP", "Web3", "Components"],
    demo: "https://www.omicron.com/",
    image: "/projects/crown.webp",
    video: "/videos/web/work-06.webm",
    mobileVideo: "",
    mobileImage: "/projects/mobile/omicron.webp",
    available: true,
  },
  {
    id: "p-puck",
    name: "Puck",
    description:
      "A hiring platform that makes a dense job marketplace feel calm and navigable.",
    technologies: ["CMS", "Search", "SEO"],
    demo: "https://www.puck.com/",
    image: "/projects/hsl.webp",
    video: "/videos/web/work-01.webm",
    mobileVideo: "",
    mobileImage: "/projects/mobile/puck.webp",
    available: true,
  },
  {
    id: "p-alosant",
    name: "Alosant",
    description:
      "Community-building software for master-planned developments, rebuilt end to end.",
    technologies: ["CMS", "Integrations", "SEO"],
    demo: "https://www.alosant.com/",
    image: "/projects/rags.webp",
    video: "/videos/web/work-03.webm",
    mobileVideo: "",
    mobileImage: "/projects/mobile/alosant.webp",
    available: true,
  },
  {
    id: "p-rayai",
    name: "RAY AI",
    description:
      "An AI assistant product site where the demo is the hero and the copy stays out of the way.",
    technologies: ["Motion", "API", "Components"],
    demo: "https://www.ray.ai/",
    image: "/projects/titi.webp",
    video: "/videos/web/work-05.webm",
    mobileVideo: "",
    mobileImage: "/projects/mobile/rayai.webp",
    available: true,
  },
];
