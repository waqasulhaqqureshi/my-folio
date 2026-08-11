import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { isAuthed } from "../../../lib/adminAuth";
import { saveHeroContent } from "../../../lib/heroContent";

/*
 * Hero image upload.
 *
 * Files land in public/uploads/ and the hero's profileImg is repointed at the
 * new path. Uploads are treated as hostile input even behind auth.
 */

const MAX_BYTES = 8 * 1024 * 1024; // 8MB

/* Allowlist by BOTH declared type and magic bytes. A client-supplied MIME type
   is just a string and can claim anything, so it is only the first gate. */
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

/** Sniff the real format from the file header. */
function sniff(buf: Uint8Array): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (PNG.every((b, i) => buf[i] === b)) return "png";
  const ascii = (s: number, e: number) => Buffer.from(buf.subarray(s, e)).toString("ascii");
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP")
    return "webp";
  if (ascii(4, 8) === "ftyp") {
    const brand = ascii(8, 12);
    if (brand.startsWith("avif") || brand.startsWith("avis") || brand.startsWith("mif1"))
      return "avif";
  }
  if (ascii(0, 6).startsWith("GIF8")) return "gif";
  return null;
}

export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get("file");
    if (f instanceof File) file = f;
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }
  if (!file) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `Image is ${(file.size / 1048576).toFixed(1)}MB — the limit is 8MB.` },
      { status: 413 }
    );
  }
  if (!ALLOWED[file.type]) {
    return NextResponse.json(
      { error: "Use a JPG, PNG, WebP, AVIF or GIF image." },
      { status: 415 }
    );
  }

  const buf = new Uint8Array(await file.arrayBuffer());
  const real = sniff(buf);
  if (!real || real !== ALLOWED[file.type]) {
    // Declared type and actual bytes disagree — reject rather than trust either.
    return NextResponse.json(
      { error: "That file isn't a valid image of the type it claims to be." },
      { status: 415 }
    );
  }

  /* Generate the filename server-side. The client's name is never used in the
     path: "../../" segments or a .html extension in a user-supplied name would
     be a path-traversal / stored-XSS vector. A random name also means repeat
     uploads never collide or get served from a stale CDN/browser cache. */
  const name = `hero-${Date.now()}-${randomBytes(4).toString("hex")}.${real}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), buf);

  const src = `/uploads/${name}`;
  await saveHeroContent({ profileImg: src });
  revalidatePath("/");

  return NextResponse.json({ ok: true, src });
}
