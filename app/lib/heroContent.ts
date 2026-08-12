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

  /* Like `list`, but an EMPTY array is a legitimate saved value rather than a
     reason to fall back. Used for optional blocks: clearing the headline must
     actually clear it, whereas `list` would silently restore the default and
     make the save look broken. */
  const optionalList = (v: unknown, fb: string[]) =>
    Array.isArray(v) && v.every((i) => typeof i === "string")
      ? (v as string[]).filter((s) => s.trim())
      : fb;

  /* Portrait path validation. This value ends up in an <img src>, and the file
     it names is whatever the admin put on disk, so it is constrained to a
     literal public-relative path under the two folders the feature owns:

       - no protocol/host  (blocks javascript:, data:, and off-site hotlinks)
       - no "..", no backslash, no control chars, no query/fragment
       - must sit directly in /uploaded/ or /projects/, with a known extension

     Anything else degrades to "" (= use the bundled portrait) rather than
     throwing: a hand-edited data file should not be able to break the hero. */
  const portraitSrc = (() => {
    const v = typeof o.portraitSrc === "string" ? o.portraitSrc.trim() : "";
    if (!v) return "";
    const ok =
      /^\/(uploaded|projects)\/[A-Za-z0-9._-]+\.(png|jpe?g|webp|avif)$/i.test(v) &&
      !v.includes("..");
    return ok ? v : "";
  })();

  return {
    brandMark: str(o.brandMark, DEFAULTS.brandMark),
    portraitSrc,
    /* A ratio without a source is meaningless, and a non-finite or absurd one
       would poison the CSS custom property that reserves the layout box. */
    portraitRatio:
      portraitSrc &&
      typeof o.portraitRatio === "number" &&
      Number.isFinite(o.portraitRatio) &&
      o.portraitRatio > 0.05 &&
      o.portraitRatio < 20
        ? o.portraitRatio
        : 0,
    portraitAlt:
      typeof o.portraitAlt === "string" ? o.portraitAlt.trim().slice(0, 200) : "",
    leftText: str(o.leftText, DEFAULTS.leftText),
    headingLines: optionalList(o.headingLines, DEFAULTS.headingLines),
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
    /* The portrait is overridable again (see portraitSrc above). coerce() still
       builds the result from a fixed key list rather than spreading the input,
       so unknown keys in the data file never reach the render. */
  };
}

export async function getHeroContent(): Promise<HC> {
  let content: HC;
  try {
    content = coerce(JSON.parse(await fs.readFile(FILE, "utf8")));
  } catch {
    // Missing or unparseable file is not an error condition — the site should
    // still render. Defaults ARE the content until someone saves.
    return DEFAULTS;
  }

  /* The portrait names a file on disk that this app does not own the lifecycle
     of — the folder exists precisely so images can be added and removed
     outside the admin panel. A path that no longer resolves would render as a
     broken <img> in the middle of the hero, so it is dropped here and the
     bundled asset takes over.
     
     coerce() has already constrained the value to /uploaded/ or /projects/ with
     a safe charset, so this join cannot escape public/. */
  if (content.portraitSrc) {
    try {
      await fs.access(path.join(process.cwd(), "public", content.portraitSrc));
    } catch {
      content = { ...content, portraitSrc: "", portraitRatio: 0 };
    }
  }

  return content;
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
