import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { isAuthed } from "../../../lib/adminAuth";
import {
  sniffFormat,
  readDimensions,
  isVideoFormat,
  type MediaFormat,
} from "../../../lib/mediaDimensions";
import {
  checkDimensions,
  specSummary,
  MEDIA_SPECS,
  type DeviceSlot,
} from "../../../lib/projectTypes";

/*
 * Project media upload, with frame-fit verification.
 *
 * The pipeline is deliberately ordered cheapest-and-most-certain first:
 *   1. auth
 *   2. size cap        — reject before buffering anything huge
 *   3. magic bytes     — the declared MIME type is a client-supplied string
 *   4. dimensions      — parsed from the container header, no ffmpeg
 *   5. frame fit       — ratio must match the CSS device frame
 *   6. write           — server-generated filename, never the client's
 *
 * Step 5 is the point of the whole route: the device frames use object-fit
 * cover, so a mis-shaped upload silently crops instead of failing loudly.
 * Rejecting at upload time with the exact numbers is far kinder than letting
 * someone discover the crop on the live site.
 *
 * The response always reports the detected dimensions — on success so the
 * editor can display them, and on failure so the user knows what to re-export.
 */

const MAX_VIDEO_BYTES = 40 * 1024 * 1024;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** Extension per detected format. Also the allowlist: absent = rejected. */
const EXT: Partial<Record<MediaFormat, string>> = {
  jpg: "jpg",
  png: "png",
  webp: "webp",
  avif: "avif",
  mp4: "mp4",
  webm: "webm",
};

function bad(error: string, status = 400, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error, ...extra }, { status });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return bad("Unauthorized", 401);

  let file: File | null = null;
  let slot: DeviceSlot = "web";
  try {
    const form = await req.formData();
    const f = form.get("file");
    if (f instanceof File) file = f;
    const s = String(form.get("slot") || "web");
    if (s !== "web" && s !== "mobile") return bad("Unknown media slot.");
    slot = s;
  } catch {
    return bad("Invalid form data.");
  }

  if (!file) return bad("No file received.");

  const buf = new Uint8Array(await file.arrayBuffer());
  const fmt = sniffFormat(buf);
  if (!fmt || !EXT[fmt]) {
    return bad(
      "Unsupported file. Use MP4 or WebM for video, or JPG, PNG, WebP or AVIF for a still.",
      415
    );
  }

  const isVideo = isVideoFormat(fmt);
  const cap = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > cap) {
    return bad(
      `File is ${(file.size / 1048576).toFixed(1)}MB — the limit for ${
        isVideo ? "video" : "images"
      } is ${cap / 1048576}MB.`,
      413
    );
  }

  const dims = readDimensions(buf, fmt);
  if (!dims) {
    /* Header unreadable. This is a hard fail rather than a warning: accepting
       it would put unverified media in the frame, which is exactly what this
       route exists to prevent. */
    return bad(
      `Could not read the dimensions of that ${fmt.toUpperCase()} file — it may be corrupt or use an unusual encoding. Required: ${specSummary(
        slot
      )}.`,
      422
    );
  }

  const fit = checkDimensions(slot, dims.width, dims.height);
  if (!fit.ok) {
    return bad(fit.reason, 422, {
      dimensions: dims,
      required: MEDIA_SPECS[slot].recommended,
      ratio: Number((dims.width / dims.height).toFixed(4)),
    });
  }

  /* Server-generated name: a client filename could carry "../" traversal or a
     .html extension (stored XSS from /uploads). The random suffix also
     prevents collisions and stale-cache hits on re-upload. */
  const ext = EXT[fmt]!;
  const kind = isVideo ? "video" : "poster";
  const name = `${slot}-${kind}-${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;

  /* Videos live under public/videos/<slot>/, stills under public/projects/.
     Keeping the two device families in separate folders means the web and
     mobile captures for one project never get confused for each other. */
  const dir = isVideo
    ? path.join(process.cwd(), "public", "videos", slot)
    : path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), buf);

  const src = isVideo ? `/videos/${slot}/${name}` : `/uploads/${name}`;

  return NextResponse.json({
    ok: true,
    src,
    kind: isVideo ? "video" : "image",
    slot,
    dimensions: dims,
    ratio: Number((dims.width / dims.height).toFixed(4)),
  });
}
