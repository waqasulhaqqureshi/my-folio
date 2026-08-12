import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { coerceSettings, type SiteSettings } from "./settingsTypes";

/*
 * Settings store — same disk-document contract as heroContent/projectContent.
 * See heroContent.ts for the read-only-filesystem caveat.
 */

export type { SiteSettings } from "./settingsTypes";

const FILE = path.join(process.cwd(), "data", "settings.json");

export async function getSettings(): Promise<SiteSettings> {
  try {
    return coerceSettings(JSON.parse(await fs.readFile(FILE, "utf8")));
  } catch {
    return coerceSettings(null); // defaults
  }
}

export async function saveSettings(patch: unknown): Promise<SiteSettings> {
  const next = coerceSettings({ ...(await getSettings()), ...(patch as object) });
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(next, null, 2), "utf8");
  await fs.rename(tmp, FILE);
  return next;
}
