import "server-only";
import { readFile, readdir } from "fs/promises";
import path from "path";
import { marked } from "marked";
import { sanitizeHtml, htmlToText } from "./sanitizeHtml";

/*
 * Blog content pipeline.
 *
 * Articles were captured from the author's Hashnode blog and committed as
 * markdown under /content/blog. They are read and rendered on the server, so
 * the client ships zero markdown/parser weight, and the posts are statically
 * generated at build time (see generateStaticParams) — no runtime fetch to a
 * third party sitting in the critical path of a page render.
 */

const POSTS_DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  dateLabel: string;
  readingTime: string;
  cover: string;
  canonical: string;
  tags: string[];
  excerpt: string;
};

export type Post = PostMeta & { html: string; headings: Heading[] };
export type Heading = { id: string; text: string; level: number };

/*
 * A slug arrives from the URL and is concatenated into a filesystem path, so
 * it is untrusted input. `../` (or an encoded variant) would otherwise let a
 * request read arbitrary files. Two defences: a strict charset that cannot
 * express traversal, and a post-resolution check that the final path is still
 * inside POSTS_DIR.
 */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function resolvePostPath(slug: string): string | null {
  if (!SLUG_RE.test(slug) || slug.length > 128) return null;
  const full = path.join(POSTS_DIR, `${slug}.md`);
  const rel = path.relative(POSTS_DIR, full);
  if (rel.startsWith("..") || path.isAbsolute(rel)) return null;
  return full;
}

/*
 * Minimal YAML frontmatter reader. A full YAML parser is a large dependency
 * (and a historical source of RCE) for content we author ourselves; we only
 * need `key: value` scalars and `[a, b]` flow lists.
 */
function parseFrontmatter(raw: string): { data: Record<string, string | string[]>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { data: {}, body: raw };

  const data: Record<string, string | string[]> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line.trim());
    if (!kv) continue;
    const [, key, rawValue] = kv;
    let value = rawValue.trim();

    if (value.startsWith("[") && value.endsWith("]")) {
      data[key] = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
      continue;
    }
    value = value.replace(/^["']|["']$/g, "");
    data[key] = value;
  }
  return { data, body: raw.slice(match[0].length) };
}

const str = (v: string | string[] | undefined, fallback = ""): string =>
  typeof v === "string" ? v : fallback;

/** GitHub-style heading slugs, deduped so in-page anchors stay unique. */
function slugifyHeading(text: string, seen: Map<string, number>): string {
  const base =
    text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 60) || "section";
  const n = seen.get(base) ?? 0;
  seen.set(base, n + 1);
  return n === 0 ? base : `${base}-${n}`;
}

function renderMarkdown(body: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const seen = new Map<string, number>();

  const renderer = new marked.Renderer();

  // Collect the outline while rendering and inject ids, so the sticky
  // "Contents" rail and the anchors it links to can never drift apart.
  renderer.heading = function ({ tokens, depth }) {
    const text = this.parser.parseInline(tokens);
    const plain = htmlToText(text, 200);
    const id = slugifyHeading(plain, seen);
    if (depth === 2 || depth === 3) headings.push({ id, text: plain, level: depth });
    return `<h${depth} id="${id}">${text}</h${depth}>\n`;
  };

  // Images render as <figure> so the alt text can double as a caption.
  renderer.image = function ({ href, text }) {
    if (!href) return "";
    const alt = text ?? "";
    const caption = alt ? `<figcaption>${alt}</figcaption>` : "";
    return `<figure class="post-figure"><img src="${href}" alt="${alt}" loading="lazy" decoding="async" />${caption}</figure>`;
  };

  /*
   * Code blocks scroll horizontally, which makes them a scrollable region.
   * Those must be keyboard-focusable or a keyboard-only user cannot reach the
   * overflowing content at all (WCAG 2.1.1).
   */
  renderer.code = function ({ text, lang }) {
    const language = (lang ?? "").split(/\s+/)[0];
    const cls = /^[\w+#-]{1,24}$/.test(language) ? ` class="language-${language}"` : "";
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const label = language ? `${language} code sample` : "code sample";
    return `<pre tabindex="0" role="region" aria-label="${label}"><code${cls}>${escaped}</code></pre>\n`;
  };

  const html = marked.parse(body, { renderer, async: false, gfm: true, breaks: false }) as string;

  // Sanitize even though we author the source: the markdown was transcribed
  // from a third-party site, and defence in depth costs nothing here.
  return { html: sanitizeHtml(html), headings };
}

export async function getPostSlugs(): Promise<string[]> {
  try {
    const files = await readdir(POSTS_DIR);
    return files.filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
  } catch {
    return [];
  }
}

export async function getPost(slug: string): Promise<Post | null> {
  const file = resolvePostPath(slug);
  if (!file) return null;

  let raw: string;
  try {
    raw = await readFile(file, "utf8");
  } catch {
    return null; // missing file → the route renders notFound()
  }

  const { data, body } = parseFrontmatter(raw);
  const { html, headings } = renderMarkdown(body);
  const title = str(data.title, slug);

  return {
    slug,
    title,
    subtitle: str(data.subtitle, title),
    date: str(data.date),
    dateLabel: str(data.dateLabel),
    readingTime: str(data.readingTime) || estimateReadingTime(body),
    cover: str(data.cover),
    canonical: str(data.canonical),
    tags: Array.isArray(data.tags) ? data.tags : [],
    excerpt: str(data.excerpt) || htmlToText(html, 180),
    html,
    headings,
  };
}

function estimateReadingTime(body: string): string {
  const words = body.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 225))} min read`;
}

/** All posts, newest first. Used by the index page and "more posts" rail. */
export async function getAllPosts(): Promise<PostMeta[]> {
  const slugs = await getPostSlugs();
  const posts = await Promise.all(slugs.map((s) => getPost(s)));
  return posts
    .filter((p): p is Post => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map(({ html, headings, ...meta }) => meta);
}
