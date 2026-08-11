# Work Section Refactor — Architecture Notes

> **Superseded in part by the second pass.** The grid/subgrid projects section and the
> bottom-dock nav described below were both wrong about the source and have been
> replaced — see `HEYNESH_PARITY.md` for the corrected architecture, the scroll-bug
> root cause, and the CSS parity measurements.


**Stack (not assumed — read from the repo):** Next.js 16.0.1 App Router, React 18, TypeScript, Tailwind 3 + hand-authored CSS, framer-motion 10. All new code is client-component React with hooks; no vanilla-JS shims.

---

## Two premises in the brief did not match the repository

| Brief said | Repo actually had | Resolution |
| --- | --- | --- |
| "Strip the default heynesh.com **remote video URLs**" | No video existed anywhere — zero `<video>` nodes, zero `.webm` references. Nothing to strip. | Built the pipeline from scratch. |
| Ingest from `./new-folder` | Directory is `./new/`, holding 6 `.webm` files (~14.7 MB) with em-dashes and `®` in the filenames, and **outside `public/`** so Next could not serve them. | `git mv` → `public/videos/work-01…06.webm`. |
| "Refactor the existing custom animated mouse script" | No custom cursor existed. Blobity was already fully removed (not even in git history), and `globals.css` already restored `cursor: default` / `cursor: pointer`. | Per your direction: magnetic-hover physics only, no trailing follower. |

The Phase 3 "restore native cursor" action was therefore already satisfied before this refactor began; the work done was building the physics layer, not undoing a visual pointer.

---

## Phase 1 — Grid / Subgrid overhaul

**Deprecated:** `.work-track-wrap` / `.work-track` — a horizontal scroll-snap rail. It hid ~60% of the portfolio behind a gesture desktop users rarely discover, tabbed unpredictably, and forced every card to a fixed `clamp()` height unrelated to its content.

**Replacement:** `.work-grid`, 1 / 2 / 3 columns at 768px / 1200px. Each card spans four row tracks and opts into them with `grid-template-rows: subgrid`, so **media frames, headings, body copy and stack chips share baselines across every card in a row** — the alignment behaviour a flex rail structurally cannot express. `@supports not (grid-template-rows: subgrid)` falls back to `auto auto 1fr auto`.

Explicit column counts rather than `auto-fit`: card width stays predictable, which keeps video decode dimensions predictable.

**Animation** (`app/hooks/useRevealGrid.ts`): one observer on the container watching all children, replacing N per-card `whileInView` motion drivers. The callback does exactly one thing — add a class. It reads no layout (`getBoundingClientRect`, `offsetTop` all absent), so it cannot force synchronous reflow. The transition itself is `opacity` + `transform` only, both compositor properties. Stagger is a `--reveal-i` custom property written once at observe-time, not per frame. Items `unobserve` themselves after firing, so the observed set drains to empty.

## Phase 2 — Local asset pipeline

`app/hooks/useLazyVideo.ts`. Two observer bands per node:

- **Prime band** (`rootMargin: 400px`) — attaches `src`, `preload="metadata"`.
- **Play band** (`threshold: 0.4`) — calls `play()`; pauses on exit.

**The leak fix.** A `<video>` that has begun buffering holds a decoded frame buffer, a media source, and a hardware decoder handle. `display:none`, React unmount, and scrolling away do **not** deterministically release these — Chromium retains them until GC, so a 6-card grid accumulates 6 VP9 decoders. The only reliable teardown is the WHATWG load algorithm reset, which the hook runs on eviction **and** on unmount:

```
pause() → removeAttribute("src") → drop <source> children → load()   // → NETWORK_EMPTY
```

**Zero CLS.** Every asset is 778×1100 (verified by parsing the EBML headers — no ffprobe in this environment). That ratio is applied as `aspect-ratio` on the frame, so the box has final geometry on first paint, before any media byte arrives. Poster and video are both absolutely positioned inside it; the poster→video crossfade cannot reflow anything.

Also handled: `preload="none"` and **no `src` in the SSR markup** (verified: 0 occurrences of `.webm` in the initial HTML), `visibilitychange` pausing so a backgrounded tab burns no decoder, and opt-out for `prefers-reduced-motion`, `Save-Data`, and 2g `effectiveType`.

## Phase 3 — Cursor physics, decoupled

`app/hooks/useMagnetic.ts`. The native cursor stays visible and authoritative; its coordinates drive transforms on the *element*, so hit-testing and a11y remain native.

- `pointermove` is passive and stores two numbers — nothing else.
- Geometry is cached and read at most once per pointer-enter; `scroll`/`resize` only flip a stale flag, measured lazily. **No layout read ever happens inside the rAF loop**, so the loop cannot trigger forced synchronous layout.
- The loop is **self-terminating**: once within a 0.05px epsilon it stops, so an idle page runs zero animation frames.
- Writes go to `--mag-x` / `--mag-y` / `--mag-scale`, consumed by a single `translate3d(...) scale(...)` — compositor-only, no layout or paint per frame.
- Gated off entirely for `(pointer: coarse)` / `(hover: none)` and `prefers-reduced-motion`. Every listener, the rAF handle, and the custom properties are torn down on unmount.

Applied to the card arrow FABs and the nav resume chip.

## Phase 4 — Navigation

Real semantics: `nav[aria-label="Primary"] > ul[role="list"] > li > a`, so screen readers announce "list, 4 items".

- `aria-current="page"` on the active section, kept in sync by an IntersectionObserver **scroll-spy** — no scroll handler, so no per-scroll-event main-thread work. The active *style* is selected off `[aria-current="page"]`, meaning the visual and accessible states cannot drift apart.
- Arrow Left/Right + Home/End move focus within the list; Tab behaviour stays standard since these are ordinary links, not a roving-tabindex toolbar.
- Anchor activation transfers focus to the target section (temporary `tabindex="-1"`, removed on blur) so keyboard context follows the viewport, and respects `prefers-reduced-motion` for the scroll behaviour.
- **Focus ring contrast:** the dock uses `mix-blend-difference` to stay legible over both the beige canvas and the dark Work panel — but a blended focus ring can compute to an invisible colour over mid-greys. `:focus-within` therefore disables the blend and drops a solid backdrop, keeping the 3px accent ring at true contrast (WCAG 2.4.11).
- 44px minimum hit areas (WCAG 2.5.8) via `min-height`, without inflating the type scale.
- Typography matches the existing in-hero `.hero-navigation-link`: uppercase, weight 500, `clamp(0.75rem, 1.18vw, 1.5rem)`, `0.04em` tracking, 1.11vw gutters.

**Resume chip:** `/resume.pdf` does not exist in the repo. Rather than shipping a link to a 404 (worse than nothing — a screen reader announces a real but broken destination), the chip renders only when `NEXT_PUBLIC_RESUME_URL` is set or you drop the file in and point the env var at it.

---

## Verification

`next build` passes; `tsc --noEmit` reports nothing from these files (the 11 remaining errors are pre-existing `require()`-of-image typings, caused by the git-ignored `next-env.d.ts`). SSR output confirmed: 5 grid cells, `aspect-ratio:778 / 1100` reserved on each, `aria-current` present, and zero `.webm` URLs in initial HTML. Subgrid and all nav focus rules confirmed present in the served CSS bundles.

Not verified in-browser: the sandbox blocks the Playwright Chromium download (TLS interception), so runtime playback, the magnetic LERP feel, and scroll-spy transitions are argued from code and served-asset inspection rather than observed. Worth a quick local pass on those three.
