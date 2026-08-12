import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_PROJECTS, type Project } from "./projectTypes";

/*
 * Project roster store — same contract as heroContent.ts: a single JSON
 * document on disk, read at render time, rewritten by the admin panel.
 *
 * Kept as a separate file from the hero so a corrupt roster cannot take the
 * hero down with it (and vice versa), and so the two can move to different
 * backing stores independently. The Vercel/read-only caveat documented in
 * heroContent.ts applies identically here.
 */

export type { Project } from "./projectTypes";

const FILE = path.join(process.cwd(), "data", "projects.json");

const str = (v: unknown, fb = "") => (typeof v === "string" ? v.trim() : fb);

/** Only same-origin absolute paths. Blocks javascript:/data: in a src slot. */
function assetPath(v: unknown, fb = ""): string {
  const s = str(v, fb);
  if (!s) return "";
  return s.startsWith("/") && !s.startsWith("//") ? s : fb;
}

/** Only http(s) for the outbound "Visit site" link. */
function externalUrl(v: unknown): string {
  const s = str(v);
  if (!s) return "";
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : "";
  } catch {
    return "";
  }
}

/**
 * Coerce one unknown record into a Project.
 *
 * Field-by-field like the hero store: never spread parsed JSON over a default,
 * because a hand-edited file would inject wrong-typed values straight into the
 * render. `index` seeds a deterministic id for legacy rows written before ids
 * existed.
 */
function coerceProject(raw: unknown, index: number): Project | null {
  const o = (raw ?? {}) as Record<string, unknown>;
  const name = str(o.name);
  // A row with no name is unrenderable and unselectable — drop it entirely
  // rather than showing a blank card in the carousel.
  if (!name) return null;

  return {
    id: str(o.id) || `p-${index}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name,
    description: str(o.description),
    technologies: Array.isArray(o.technologies)
      ? o.technologies.filter((t): t is string => typeof t === "string" && !!t.trim()).map((t) => t.trim()).slice(0, 12)
      : [],
    demo: externalUrl(o.demo),
    image: assetPath(o.image),
    video: assetPath(o.video),
    mobileVideo: assetPath(o.mobileVideo),
    mobileImage: assetPath(o.mobileImage),
    available: typeof o.available === "boolean" ? o.available : true,
  };
}

function coerce(raw: unknown): Project[] {
  if (!Array.isArray(raw)) return DEFAULT_PROJECTS;
  const list = raw
    .map(coerceProject)
    .filter((p): p is Project => p !== null);

  /* De-duplicate ids: two rows sharing an id would make React key collisions
     and make the editor's update-by-id hit the wrong row. */
  const seen = new Set<string>();
  const unique = list.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  // An empty file means "no projects yet", which is a legitimate state after
  // deleting everything — only a MISSING file falls back to the seed roster.
  return unique;
}

export async function getProjects(): Promise<Project[]> {
  try {
    return coerce(JSON.parse(await fs.readFile(FILE, "utf8")));
  } catch {
    return DEFAULT_PROJECTS;
  }
}

/** Only the projects the site should actually display. */
export async function getVisibleProjects(): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.available);
}

export async function saveProjects(patch: unknown): Promise<Project[]> {
  const next = coerce(patch);
  await fs.mkdir(path.dirname(FILE), { recursive: true });

  // Atomic write — see heroContent.ts. A truncated roster would silently
  // degrade to the seed list, i.e. the user's edits would appear to revert.
  const tmp = `${FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(next, null, 2), "utf8");
  await fs.rename(tmp, FILE);
  return next;
}
