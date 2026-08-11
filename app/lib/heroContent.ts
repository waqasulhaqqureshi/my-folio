import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_HERO as DEFAULTS, type HeroContent as HC } from "./heroTypes";

/*
 * Hero content store — a single JSON document on disk, read by the page at
 * render time and rewritten by the admin panel.
 *
 * WHY A FILE AND NOT localStorage
 * localStorage would only change what the editor's own browser sees, which is
 * useless for a portfolio — visitors would still get the old hero. The content
 * has to live server-side to be real.
 *
 * DEPLOYMENT CAVEAT (important)
 * This requires a writable filesystem, so it works with `next start` on a VM,
 * a container with a mounted volume, or locally. It does NOT work on Vercel or
 * any serverless host, where the filesystem is read-only and per-invocation.
 * Moving to a hosted store later means reimplementing only read()/write()
 * below — every caller goes through this module.
 */

export type { HeroContent } from "./heroTypes";
export { DEFAULT_HERO } from "./heroTypes";

const FILE = path.join(process.cwd(), "data", "site-content.json");

/**
 * Coerce unknown JSON into HeroContent, field by field.
 *
 * Never spread the parsed object over the defaults: a hand-edited or truncated
 * file would inject `undefined`/wrong-typed values straight into the render and
 * crash the hero. Each field is validated and falls back independently, so a
 * partially corrupt file degrades to defaults instead of breaking the page.
 */
function coerce(raw: unknown): HC {
  const o = (raw ?? {}) as Record<string, unknown>;
  const str = (v: unknown, fb: string) =>
    typeof v === "string" && v.trim() ? v : fb;
  const list = (v: unknown, fb: string[]) =>
    Array.isArray(v) && v.every((i) => typeof i === "string") && v.length
      ? (v as string[])
      : fb;

  return {
    brandMark: str(o.brandMark, DEFAULTS.brandMark),
    leftText: str(o.leftText, DEFAULTS.leftText),
    headingLines: list(o.headingLines, DEFAULTS.headingLines),
    ctaPrimary: str(o.ctaPrimary, DEFAULTS.ctaPrimary),
    ctaSecondary: str(o.ctaSecondary, DEFAULTS.ctaSecondary),
    rightText: str(o.rightText, DEFAULTS.rightText),
    projectsStat: str(o.projectsStat, DEFAULTS.projectsStat),
    projectsLabel: str(o.projectsLabel, DEFAULTS.projectsLabel),
    yearsStat:
      typeof o.yearsStat === "number" && Number.isFinite(o.yearsStat)
        ? Math.max(0, Math.min(99, Math.round(o.yearsStat)))
        : DEFAULTS.yearsStat,
    yearsLabelLines: list(o.yearsLabelLines, DEFAULTS.yearsLabelLines),
    skills: list(o.skills, DEFAULTS.skills),
    profileImg: str(o.profileImg, DEFAULTS.profileImg),
    profileImgAlt: str(o.profileImgAlt, DEFAULTS.profileImgAlt),
  };
}

export async function getHeroContent(): Promise<HC> {
  try {
    return coerce(JSON.parse(await fs.readFile(FILE, "utf8")));
  } catch {
    // Missing or unparseable file is not an error condition — the site should
    // still render. Defaults ARE the content until someone saves.
    return DEFAULTS;
  }
}

export async function saveHeroContent(patch: unknown): Promise<HC> {
  const next = coerce({ ...(await getHeroContent()), ...(patch as object) });
  await fs.mkdir(path.dirname(FILE), { recursive: true });

  /* Atomic write: a crash midway through a plain writeFile leaves a truncated
     file that coerce() would silently reduce to defaults — i.e. the user's
     content would vanish. Write a sibling temp file, then rename, which is
     atomic on POSIX. */
  const tmp = `${FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(next, null, 2), "utf8");
  await fs.rename(tmp, FILE);
  return next;
}
