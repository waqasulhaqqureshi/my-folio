/*
 * Intrinsic dimension extraction, straight from container bytes.
 *
 * There is no ffmpeg/ffprobe in the deploy target, and shelling out to one
 * would be a liability anyway (arbitrary binary, arbitrary input). Every
 * format below stores width/height in a fixed, cheaply-locatable header, so a
 * few hundred bytes of parsing replaces the dependency entirely.
 *
 * Parsers are deliberately defensive: input is an untrusted upload, so every
 * read is bounds-checked and a malformed file returns null rather than
 * throwing or looping.
 */

export type Dimensions = { width: number; height: number };

const ascii = (b: Uint8Array, s: number, e: number) =>
  String.fromCharCode(...b.subarray(s, Math.min(e, b.length)));

const u16 = (b: Uint8Array, o: number) => (b[o]! << 8) | b[o + 1]!;
const u32 = (b: Uint8Array, o: number) =>
  ((b[o]! << 24) | (b[o + 1]! << 16) | (b[o + 2]! << 8) | b[o + 3]!) >>> 0;

/* ---------- Images -------------------------------------------------------- */

function png(b: Uint8Array): Dimensions | null {
  // IHDR is always the first chunk: 8-byte signature, 4-byte length, "IHDR".
  if (b.length < 24 || ascii(b, 12, 16) !== "IHDR") return null;
  return { width: u32(b, 16), height: u32(b, 20) };
}

function jpeg(b: Uint8Array): Dimensions | null {
  // Walk the marker chain to the first SOFn frame header.
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) {
      i++; // resync rather than abort: some encoders emit fill bytes
      continue;
    }
    const marker = b[i + 1]!;
    // SOF0-SOF15, excluding DHT(c4), JPG(c8) and DAC(cc) which share the range.
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: u16(b, i + 5), width: u16(b, i + 7) };
    }
    const len = u16(b, i + 2);
    if (len < 2) return null; // malformed: would not advance
    i += 2 + len;
  }
  return null;
}

function webp(b: Uint8Array): Dimensions | null {
  // Three sub-formats, each storing size differently.
  const chunk = ascii(b, 12, 16);
  if (chunk === "VP8X" && b.length >= 30) {
    // 24-bit little-endian, stored as (value - 1).
    const w = 1 + (b[24]! | (b[25]! << 8) | (b[26]! << 16));
    const h = 1 + (b[27]! | (b[28]! << 8) | (b[29]! << 16));
    return { width: w, height: h };
  }
  if (chunk === "VP8 " && b.length >= 30) {
    // Lossy: 14-bit dimensions after the 3-byte start code 0x9d012a.
    return { width: (b[26]! | (b[27]! << 8)) & 0x3fff, height: (b[28]! | (b[29]! << 8)) & 0x3fff };
  }
  if (chunk === "VP8L" && b.length >= 25) {
    // Lossless: 14 bits each, packed across a 32-bit LE field after the sig.
    const bits = b[21]! | (b[22]! << 8) | (b[23]! << 16) | (b[24]! << 24);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  return null;
}

function gif(b: Uint8Array): Dimensions | null {
  if (b.length < 10) return null;
  return { width: b[6]! | (b[7]! << 8), height: b[8]! | (b[9]! << 8) };
}

/* ---------- ISO base media (MP4 / MOV / AVIF / HEIC) ---------------------- */

/**
 * Find the video track's display size from the `tkhd` box.
 *
 * Walks the box tree only through the containers that can hold a track
 * (moov > trak > tkhd), rather than scanning for the magic string — a raw
 * scan can hit the same four bytes inside compressed sample data.
 */
function iso(b: Uint8Array): Dimensions | null {
  let best: Dimensions | null = null;

  const walk = (start: number, end: number, depth: number) => {
    if (depth > 5) return;
    let o = start;
    while (o + 8 <= end) {
      let size = u32(b, o);
      const type = ascii(b, o + 4, o + 8);
      let head = 8;
      if (size === 1) {
        // 64-bit size. The high word is always 0 for anything we accept
        // (uploads are capped well below 4GB), so only the low word matters.
        if (o + 16 > end) return;
        size = u32(b, o + 12);
        head = 16;
      } else if (size === 0) {
        size = end - o; // "extends to end of file"
      }
      if (size < head || o + size > end) return; // malformed / truncated

      if (type === "moov" || type === "trak" || type === "mdia") {
        walk(o + head, o + size, depth + 1);
      } else if (type === "tkhd") {
        /* tkhd layout: version(1) flags(3) then times. Version 1 uses 64-bit
           creation/modification/duration, shifting the tail by 12 bytes.
           Width/height are the LAST 8 bytes of the box, as 16.16 fixed point. */
        const p = o + size - 8;
        if (p >= o + head) {
          const w = u32(b, p) / 65536;
          const h = u32(b, p + 4) / 65536;
          // Audio and metadata tracks carry 0x0 — only keep a real visual track.
          if (w >= 1 && h >= 1) {
            const dim = { width: Math.round(w), height: Math.round(h) };
            if (!best || dim.width * dim.height > best.width * best.height) best = dim;
          }
        }
      }
      o += size;
    }
  };

  walk(0, b.length, 0);
  return best;
}

/* ---------- Matroska / WebM ----------------------------------------------- */

/**
 * Read PixelWidth (0xB0) and PixelHeight (0xBA) from the first video track.
 *
 * EBML is a nested TLV format with variable-length IDs and sizes, so this is a
 * real (if small) parser: descend only into the master elements on the path
 * Segment > Tracks > TrackEntry > Video, and skip everything else by size.
 * A flat byte-scan for 0xB0 would match constantly inside cluster payloads.
 */
function ebml(b: Uint8Array): Dimensions | null {
  let pos = 0;

  /** Element IDs keep their leading length bits — they are compared as-is. */
  const readId = (): number | null => {
    if (pos >= b.length) return null;
    const first = b[pos]!;
    const len = first >= 0x80 ? 1 : first >= 0x40 ? 2 : first >= 0x20 ? 3 : first >= 0x10 ? 4 : 0;
    if (!len || pos + len > b.length) return null;
    let v = 0;
    for (let i = 0; i < len; i++) v = v * 256 + b[pos + i]!;
    pos += len;
    return v;
  };

  /** Sizes drop the length marker bit. An all-ones size means "unknown". */
  const readSize = (): number | null => {
    if (pos >= b.length) return null;
    const first = b[pos]!;
    let len = 0;
    for (let i = 0; i < 8; i++) {
      if (first & (0x80 >> i)) {
        len = i + 1;
        break;
      }
    }
    if (!len || pos + len > b.length) return null;
    let v = first & (0xff >> len);
    let unknown = v === (0xff >> len);
    for (let i = 1; i < len; i++) {
      const byte = b[pos + i]!;
      if (byte !== 0xff) unknown = false;
      v = v * 256 + byte;
    }
    pos += len;
    return unknown ? Number.MAX_SAFE_INTEGER : v;
  };

  const uint = (n: number): number => {
    let v = 0;
    for (let i = 0; i < n && pos + i < b.length; i++) v = v * 256 + b[pos + i]!;
    return v;
  };

  // Master elements worth descending into, on the path to Video.
  const DESCEND = new Set([
    0x18538067, // Segment
    0x1654ae6b, // Tracks
    0xae, // TrackEntry
    0xe0, // Video
  ]);

  let width = 0;
  let height = 0;

  const walk = (end: number, depth: number) => {
    if (depth > 6) return;
    while (pos < end && !(width && height)) {
      const id = readId();
      if (id === null) return;
      const size = readSize();
      if (size === null) return;
      const stop = Math.min(size === Number.MAX_SAFE_INTEGER ? end : pos + size, end);
      if (stop < pos) return;

      if (DESCEND.has(id)) {
        walk(stop, depth + 1);
        pos = stop;
      } else if (id === 0xb0) {
        width = uint(size);
        pos = stop;
      } else if (id === 0xba) {
        height = uint(size);
        pos = stop;
      } else if (id === 0x1f43b675) {
        /* Cluster — media payload begins, so every header we care about has
           already been seen. Stop instead of parsing megabytes of frames. */
        return;
      } else {
        pos = stop;
      }
    }
  };

  // Skip the EBML header element, then walk the segment.
  const id = readId();
  if (id !== 0x1a45dfa3) return null;
  const hdr = readSize();
  if (hdr === null) return null;
  pos += hdr;
  walk(b.length, 0);

  return width && height ? { width, height } : null;
}

/* ---------- Dispatch ------------------------------------------------------ */

/** Format detected from magic bytes — never from the client's declared type. */
export type MediaFormat =
  | "jpg" | "png" | "webp" | "gif" | "avif"
  | "mp4" | "webm";

export function sniffFormat(b: Uint8Array): MediaFormat | null {
  if (b.length < 16) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b[0] === 0x89 && ascii(b, 1, 4) === "PNG") return "png";
  if (ascii(b, 0, 4) === "GIF8") return "gif";
  if (ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP") return "webp";
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return "webm";
  if (ascii(b, 4, 8) === "ftyp") {
    const brand = ascii(b, 8, 12);
    if (brand.startsWith("avif") || brand.startsWith("avis")) return "avif";
    // isom/mp41/mp42/iso2/M4V /qt — all parse with the same ISO box walker.
    return "mp4";
  }
  return null;
}

export function readDimensions(b: Uint8Array, fmt: MediaFormat): Dimensions | null {
  const d =
    fmt === "png" ? png(b)
    : fmt === "jpg" ? jpeg(b)
    : fmt === "webp" ? webp(b)
    : fmt === "gif" ? gif(b)
    : fmt === "avif" || fmt === "mp4" ? iso(b)
    : fmt === "webm" ? ebml(b)
    : null;

  // Guard against a parser returning a nonsense value from a crafted header.
  if (!d || d.width < 1 || d.height < 1 || d.width > 20000 || d.height > 20000) return null;
  return d;
}

export const isVideoFormat = (f: MediaFormat) => f === "mp4" || f === "webm";
