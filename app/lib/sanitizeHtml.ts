import { parse, HTMLElement, NodeType } from "node-html-parser";

/*
 * Allowlist HTML sanitizer for third-party article bodies.
 *
 * WHY THIS IS NOT OPTIONAL
 * We render remote HTML into our own origin. Without sanitizing, a compromised
 * or malicious source page gives an attacker script execution on OUR domain —
 * which means our admin session cookie, our forms, our users. `dangerously-
 * SetInnerHTML` on unsanitized remote content is the textbook stored-XSS hole.
 *
 * WHY ALLOWLIST, NEVER BLOCKLIST
 * Blocklists ("strip <script>") lose. Attack surface includes onerror=,
 * onload=, javascript: URLs, <svg><animate>, <iframe srcdoc>, <object>,
 * <form> overlays, CSS expression()… Enumerating the bad set is unbounded.
 * Enumerating the good set is small and finite, so anything unrecognised is
 * dropped by default.
 *
 * DOMPurify is the usual answer but needs a DOM (jsdom) on the server; this
 * runs in the Next server runtime with no DOM, so the allowlist is hand-rolled.
 */

/** Tags kept, with their permitted attributes. Everything else is dropped. */
const ALLOWED: Record<string, readonly string[]> = {
  p: [],
  br: [],
  hr: [],
  h1: ["id"],
  h2: ["id"],
  h3: ["id"],
  h4: ["id"],
  h5: ["id"],
  h6: ["id"],
  ul: [],
  ol: ["start"],
  li: [],
  blockquote: [],
  // tabindex on <pre> only, so a horizontally scrolling code block is
  // reachable by keyboard (WCAG 2.1.1). Value is validated below.
  pre: ["tabindex", "role", "aria-label"],
  code: ["class"],
  strong: [],
  b: [],
  em: [],
  i: [],
  u: [],
  s: [],
  del: [],
  ins: [],
  mark: [],
  sup: [],
  sub: [],
  a: ["href", "title"],
  img: ["src", "alt", "width", "height"],
  figure: [],
  figcaption: [],
  table: [],
  thead: [],
  tbody: [],
  tfoot: [],
  tr: [],
  th: ["colspan", "rowspan"],
  td: ["colspan", "rowspan"],
  span: [],
  div: [],
  section: [],
};

/*
 * Tags whose CONTENT must die with them. For most tags we unwrap (keep the
 * text, drop the wrapper) so prose survives odd markup — but the text inside
 * <script> or <style> is executable/mutating code, so unwrapping it would
 * paste raw JS into the document body.
 */
const DROP_WITH_CONTENT = new Set([
  "script",
  "style",
  "noscript",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "button",
  "select",
  "textarea",
  "svg",
  "math",
  "template",
  "link",
  "meta",
  "base",
  "title",
  "head",
]);

/** Only these URL schemes may appear in href/src. */
function safeUrl(raw: string | undefined, allowRelative: boolean): string | null {
  if (!raw) return null;
  const v = raw.trim();
  if (!v) return null;

  // Reject control characters outright: "java\0script:" and "java\tscript:"
  // are classic filter bypasses that browsers still normalise and execute.
  if (/[\u0000-\u001f\u007f]/.test(v)) return null;

  if (v.startsWith("//")) return `https:${v}`;
  if (allowRelative && v.startsWith("/")) return v;
  if (v.startsWith("#")) return v;

  try {
    const u = new URL(v);
    if (u.protocol === "http:" || u.protocol === "https:" || u.protocol === "mailto:") {
      return u.href;
    }
    return null; // javascript:, data:, vbscript:, file: …
  } catch {
    return null; // not absolute and not an allowed relative form
  }
}

/** Class attribute is allowed only for syntax-highlight hints. */
function safeClass(raw: string | undefined): string | null {
  if (!raw) return null;
  const kept = raw
    .split(/\s+/)
    .filter((c) => /^(language-[\w+#-]+|hljs|lang-[\w+#-]+)$/i.test(c));
  return kept.length ? kept.join(" ") : null;
}

const VOID = new Set(["br", "hr", "img"]);

/** Validated attribute string for <pre>, shared by the raw-text branch. */
function preAttributes(el: HTMLElement): string {
  const out: string[] = [];
  // Only "0": a positive tabindex reorders the page's tab sequence.
  if (el.getAttribute("tabindex")?.trim() === "0") out.push('tabindex="0"');
  const role = el.getAttribute("role");
  if (role && /^[\w-]{1,24}$/.test(role)) out.push(`role="${escapeAttr(role)}"`);
  const label = el.getAttribute("aria-label");
  if (label && /^[\w\s.,:'()-]{1,80}$/.test(label)) out.push(`aria-label="${escapeAttr(label)}"`);
  return out.length ? " " + out.join(" ") : "";
}

function escapeText(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
  return escapeText(s).replace(/"/g, "&quot;");
}

function render(node: HTMLElement | { nodeType: number; rawText?: string; text?: string }): string {
  // Text node: escape and emit. This is what neutralises any markup that
  // survived as text.
  if (node.nodeType === NodeType.TEXT_NODE) {
    return escapeText((node as { text?: string }).text ?? "");
  }
  if (node.nodeType !== NodeType.ELEMENT_NODE) return ""; // comments etc.

  const el = node as HTMLElement;
  const tag = el.rawTagName?.toLowerCase();
  if (!tag) return "";

  if (DROP_WITH_CONTENT.has(tag)) return "";

  /*
   * <pre> is a "block text element": the parser hands us its contents as ONE
   * raw-text node holding unparsed HTML source, so the normal path would
   * escape the whole thing and show the reader a literal `<code class=…>`.
   * Turning that off instead makes the parser discard the contents entirely.
   * So re-parse the raw inner source here and run the result through the same
   * allowlist — entities decode on parse and are re-escaped on render, leaving
   * code samples byte-accurate and inert.
   */
  if (tag === "pre") {
    const inner = parse(el.innerHTML, { lowerCaseTagName: true, comment: false });
    const body = inner.childNodes.map((c) => render(c as HTMLElement)).join("");
    const attrs = preAttributes(el);
    return `<pre${attrs}>${body}</pre>`;
  }

  const children = el.childNodes.map((c) => render(c as HTMLElement)).join("");

  // Unknown-but-harmless tag: unwrap so the prose inside is not lost.
  if (!(tag in ALLOWED)) return children;

  const attrs: string[] = [];
  for (const name of ALLOWED[tag]) {
    const raw = el.getAttribute(name);
    if (raw == null) continue;

    if (name === "href") {
      const u = safeUrl(raw, true);
      if (u) attrs.push(`href="${escapeAttr(u)}"`);
    } else if (name === "src") {
      const u = safeUrl(raw, true);
      if (u) attrs.push(`src="${escapeAttr(u)}"`);
    } else if (name === "class") {
      const c = safeClass(raw);
      if (c) attrs.push(`class="${escapeAttr(c)}"`);
    } else if (name === "width" || name === "height" || name === "colspan" || name === "rowspan" || name === "start") {
      if (/^\d{1,5}$/.test(raw.trim())) attrs.push(`${name}="${raw.trim()}"`);
    } else if (name === "tabindex") {
      // Only "0" is permitted: a positive tabindex reorders the whole page's
      // tab sequence, and a negative one removes the element from it.
      if (raw.trim() === "0") attrs.push(`tabindex="0"`);
    } else if (name === "role" || name === "aria-label") {
      if (/^[\w\s.,:'()-]{1,80}$/.test(raw)) attrs.push(`${name}="${escapeAttr(raw)}"`);
    } else if (name === "id") {
      // Keep only simple slugs so an id can't collide with our own elements
      // or break querySelector consumers.
      if (/^[A-Za-z][\w-]{0,64}$/.test(raw)) attrs.push(`id="${escapeAttr(raw)}"`);
    } else {
      attrs.push(`${name}="${escapeAttr(raw)}"`);
    }
  }

  // External links must not hand the opener window to the target page
  // (reverse tabnabbing), and should be visibly external.
  if (tag === "a") {
    const href = attrs.find((a) => a.startsWith("href="));
    if (!href) return children; // link with no safe href → keep the text only
    if (/^href="https?:/.test(href)) {
      attrs.push('target="_blank"', 'rel="noopener noreferrer nofollow"');
    }
  }

  if (tag === "img") {
    if (!attrs.some((a) => a.startsWith("src="))) return "";
    attrs.push('loading="lazy"', 'decoding="async"');
  }

  const open = `<${tag}${attrs.length ? " " + attrs.join(" ") : ""}>`;
  return VOID.has(tag) ? open : `${open}${children}</${tag}>`;
}

export function sanitizeHtml(dirty: string): string {
  if (!dirty) return "";
  const root = parse(dirty, {
    lowerCaseTagName: true,
    comment: false,
    // script/style/noscript are dropped wholesale by DROP_WITH_CONTENT.
    // pre stays a block-text element; the render() pre branch re-parses it.
    blockTextElements: { script: false, noscript: false, style: false, pre: true },
  });
  return root.childNodes.map((n) => render(n as HTMLElement)).join("").trim();
}

/** Plain-text excerpt, for meta descriptions and card previews. */
export function htmlToText(html: string, limit = 200): string {
  const text = parse(html).text.replace(/\s+/g, " ").trim();
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
}
