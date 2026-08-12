/*
 * Projects data — heynesh.com "Built in Webflow, Made to Perform" section.
 *
 * Content is the source's own project roster, in source order, with the exact
 * three-label stacks and copy used on the live site. Media is re-pointed at the
 * repo's LOCAL videos (public/videos) — no remote Webflow CDN URLs.
 */
export type ProjectProps = {
  id: number;
  name: string;
  description: string;
  technologies: string[];
  demo: string;
  /** Local poster still (first frame stand-in) — reserved box, zero CLS. */
  image: string;
  video: string;
  available: boolean;
};

export const devProjects: ProjectProps[] = [
  {
    id: 0,
    name: "1910.ai",
    description:
      "Pioneering small and large molecule therapeutics discovery by integrating multimodal data.",
    technologies: ["Components", "GSAP", "SEO"],
    demo: "https://www.1910.ai/",
    image: "/projects/synthetix.png",
    video: "/videos/work-01.webm",
    available: true,
  },
  {
    id: 1,
    name: "SemiconBio",
    description:
      "Fully realizing the promise of molecular electronics with the SemiconBio platform.",
    technologies: ["CMS", "API", "Motion"],
    demo: "https://www.semiconbio.com/",
    image: "/projects/interlock-new.png",
    video: "/videos/work-02.webm",
    available: true,
  },
  {
    id: 2,
    name: "Happy Ring",
    description:
      "With accuracy validated to strict standards and all-day comfort exceeding expectations.",
    technologies: ["CMS", "GSAP", "SEO"],
    demo: "https://happyring.fiftyseven.co/",
    image: "/projects/odunsi.png",
    video: "/videos/work-03.webm",
    available: true,
  },
  {
    id: 3,
    name: "PSSLTD",
    description:
      "With asset and inspection management purpose-built alongside UK councils for over 35 years, and a record every audit can stand behind.",
    technologies: ["CMS", "GSAP", "Localization"],
    demo: "https://pssltd.co.uk/",
    image: "/projects/propellent-new.png",
    video: "/videos/work-04.webm",
    available: true,
  },
  {
    id: 4,
    name: "Lilipad",
    description:
      "With libraries that come to children where they are, and a quiet place to belong when stability of any kind is rare.",
    technologies: ["CMS", "GSAP", "SEO"],
    demo: "https://www.lilipadlibrary.org/",
    image: "/projects/flixify-new.png",
    video: "/videos/work-05.webm",
    available: true,
  },
  {
    id: 5,
    name: "Omicron",
    description:
      "Omicron is a blockchain studio helping Web 3.0 players turn ideas into decentralized products.",
    technologies: ["Webflow", "Motion"],
    demo: "https://omicronblockchain.com/",
    image: "/projects/crown.webp",
    video: "/videos/work-06.webm",
    available: true,
  },
  {
    id: 6,
    name: "Puck",
    description:
      "Inbound talent solution with personal automation - from podcasts to smarter screening.",
    technologies: ["Components", "CMS", "GSAP"],
    demo: "https://www.careerpuck.com/",
    image: "/projects/hsl.webp",
    video: "/videos/work-01.webm",
    available: true,
  },
  {
    id: 7,
    name: "Alosant",
    description:
      "The leading resident experience platform, elevates living by keeping residents and shoppers informed.",
    technologies: ["Performance", "CMS", "API"],
    demo: "https://www.alosant.com/",
    image: "/projects/rags.webp",
    video: "/videos/work-03.webm",
    available: true,
  },
  {
    id: 8,
    name: "RAY AI",
    description:
      "With a full-time human assistant handpicked from the top 0.03% of applicants, and the AI fluency to give you your time and energy back.",
    technologies: ["CMS", "GSAP", "Performance"],
    demo: "https://getray.ai/",
    image: "/projects/titi.webp",
    video: "/videos/work-05.webm",
    available: true,
  },
];
