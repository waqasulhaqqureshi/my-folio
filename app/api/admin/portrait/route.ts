import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { isAuthed } from "../../../lib/adminAuth";
import { sniffFormat, readDimensions } from "../../../lib/mediaDimensions";
import { HERO_PORTRAIT } from "../../../lib/heroTypes";

/*
 * Hero portrait library + upload.
 *
 * Replaces the 410 stub that stood here while the portrait was locked. Two
 * verbs, one folder:
 *
 *   GET   list every usable image in public/uploaded/, with its measured
 *         dimensions, so the panel can offer files the user dropped in over
 *         SFTP/Finder — not just ones uploaded through the browser.
 *   POST  accept a file and write it into the same folder, so both routes
 *         converge on one source of truth.
 *
 * Nothing here mutates the hero document. Choosing which image is live is a
 * separate PUT /api/admin/hero, which means uploading is non-destructive: the
 * file appears in the library and the site is unchanged until it is picked.
 * That split also makes the two failure modes independent — a bad upload
 * cannot corrupt the content document, and a failed save cannot orphan a
 * half-written file into the live render.
 */

const DIR = path.join(process.cwd(), "public", "uploaded");
const URL_BASE = "/uploaded";
const MAX_BYTES = 8 * 1024 * 1024;

/** Detected format -> extension. Also the allowlist: absent = rejected. */
const EXT = {
  png: "png",
  jpg: "jpg",
  webp: "webp",
  avif: "avif",
} as const;

type OkFormat = keyof typeof EXT;
const isOkFormat = (f: string | null): f is OkFormat => !!f && f in EXT;

/** Same set, matched on the way OUT when listing the folder. */
const LISTABLE = /\.(png|jpe?g|webp|avif)$/i;

const bad = (error: string, status = 400, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ error, ...extra }, { status });

export type PortraitEntry = {
  src: string;
  name: string;
  width: number;
  height: number;
  ratio: number;
  bytes: number;
  mtime: number;
};

/**
 * Read every image in the folder and measure it.
 *
 * Measuring on read rather than trusting a manifest is deliberate: the whole
 * point of the folder is that files can arrive without the app's involvement,
 * so any cached index would be wrong the moment someone copies a file in.
 * Headers only — `readDimensions` parses the container, it does not decode
 * pixels — so this stays cheap enough to run per request.
 *
 * A file that cannot be sniffed or measured is skipped rather than surfaced as
 * an error: one stray .DS_Store or truncated download should not blank out an
 * otherwise working picker.
 */
async function listPortraits(): Promise<PortraitEntry[]> {
  let names: string[];
  try {
    names = await fs.readdir(DIR);
  } catch {
    return []; // folder not created yet — an empty library, not a failure
  }

  const out: PortraitEntry[] = [];
  for (const name of names) {
    if (!LISTABLE.test(name)) continue;
    const abs = path.join(DIR, name);
    try {
      const st = await fs.stat(abs);
      if (!st.isFile() || st.size === 0) continue;

      /* Only the header is needed; 64KB comfortably covers every format's
         dimension fields without pulling whole multi-MB files into memory. */
      const fh = await fs.open(abs, "r");
      /* Plain Uint8Array, not Buffer: Buffer's `buffer` is ArrayBufferLike,
         which is not assignable to the ArrayBuffer-backed Uint8Array the
         sniffer takes. */
      const buf = new Uint8Array(Math.min(65536, st.size));
      await fh.read({ buffer: buf, offset: 0, length: buf.length, position: 0 });
      await fh.close();

      const fmt = sniffFormat(buf);
      if (!isOkFormat(fmt)) continue;
      const dim = readDimensions(buf, fmt);
      if (!dim || !dim.width || !dim.height) continue;

      out.push({
        src: `${URL_BASE}/${name}`,
        name,
        width: dim.width,
        height: dim.height,
        ratio: dim.width / dim.height,
        bytes: st.size,
        mtime: st.mtimeMs,
      });
    } catch {
      continue;
    }
  }

  /* Newest first: after an upload the file the user just added is the one they
     are looking for, and it should not be buried alphabetically. */
  return out.sort((a, b) => b.mtime - a.mtime);
}

export async function GET() {
  if (!(await isAuthed())) return bad("Unauthorized", 401);
  return NextResponse.json({
    items: await listPortraits(),
    bundled: {
      src: HERO_PORTRAIT.src,
      ratio: HERO_PORTRAIT.ratio,
      alt: HERO_PORTRAIT.alt,
    },
  });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return bad("Unauthorized", 401);

  let file: File | null = null;
  try {
    const fd = await req.formData();
    const f = fd.get("file");
    if (f instanceof File) file = f;
  } catch {
    return bad("Could not read the upload.");
  }
  if (!file) return bad("No file was included in the request.");

  /* Cheapest check first: reject on the declared size before buffering. */
  if (file.size > MAX_BYTES) {
    return bad(
      `That file is ${(file.size / 1048576).toFixed(1)} MB. The limit is 8 MB — export it smaller.`,
    );
  }
  if (file.size === 0) return bad("That file is empty.");

  const buf = new Uint8Array(await file.arrayBuffer());

  /* Magic bytes, not the declared MIME type: `file.type` is a client-supplied
     string and is trivially forged. The extension written below is derived
     from what the bytes actually are, so a .png that is really something else
     cannot end up served with an image content-type. */
  const fmt = sniffFormat(buf);
  if (!isOkFormat(fmt)) {
    return bad(
      "That does not look like a PNG, JPEG, WebP or AVIF image. Convert it and try again.",
    );
  }

  const dim = readDimensions(buf, fmt);
  if (!dim || !dim.width || !dim.height) {
    return bad("Could not read that image's dimensions — the file may be damaged.");
  }
  if (dim.width < 400) {
    return bad(
      `That image is only ${dim.width}px wide. Use at least 400px (1140px or more is ideal for retina screens).`,
      400,
      { width: dim.width, height: dim.height },
    );
  }

  /* Server-generated filename. The client's name is never used as a path
     component: it can contain traversal sequences, NUL bytes, or a name that
     collides with an existing file and silently replaces it. The original stem
     is kept as a readable prefix, but only after being stripped to a safe
     charset and truncated. */
  const stem =
    (file.name || "portrait")
      .replace(/\.[^.]*$/, "")
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40)
      .toLowerCase() || "portrait";
  const filename = `${stem}-${randomBytes(4).toString("hex")}.${EXT[fmt]}`;

  try {
    await fs.mkdir(DIR, { recursive: true });
    /* wx: fail rather than overwrite. The random suffix makes a collision
       essentially impossible, so if one happens something is wrong and
       clobbering someone else's image is the worst possible response. */
    await fs.writeFile(path.join(DIR, filename), buf, { flag: "wx" });
  } catch {
    return bad(
      "Could not save the file. The server's uploaded folder may not be writable.",
      500,
    );
  }

  return NextResponse.json({
    src: `${URL_BASE}/${filename}`,
    name: filename,
    width: dim.width,
    height: dim.height,
    ratio: dim.width / dim.height,
    bytes: buf.byteLength,
    mtime: Date.now(),
  });
}
