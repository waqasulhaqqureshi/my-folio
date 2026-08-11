# heynesh.com Parity — Second Pass

Three things were wrong. All three are fixed.

---

## 1. Scroll dies after a while — root cause found

`globals.css` shipped **`body { overflow-y: hidden }` as the default state**, and the PreLoader released it by writing an inline `style.overflowY = "auto"`. Both modals then "restored" scroll like this:

```js
document.body.style.overflow  = "";   // ← does NOT restore the old inline value
document.body.style.overflowY = "";   //    it falls back to the STYLESHEET value
```

The stylesheet value was `hidden`. So clearing the inline style re-applied the lock permanently.

Worse, the modal effect ran `unlockBodyScroll()` on the **`else` branch** — meaning a modal that was merely *mounted and closed* (which is every blog and certificate card, on every page load) wiped the preloader's release. That is the "works at first, then stops" behaviour: it broke the first time any card mounted or any modal was opened and closed.

**Fix** — `app/lib/scrollLock.ts`: an additive, reference-counted lock keyed on a class. Scrollable is now the *default*, so a stray "reset to default" yields a scrollable page instead of a dead one, and overlapping owners (preloader + modal) can no longer unlock each other. Verified by simulating the exact cycle — preloader release, then repeated modal open/close — ending scrollable every time.

## 2. Projects section — the grid was the wrong shape entirely

I checked the source's live stylesheet this time instead of inferring. It says:

```css
.work_section    { min-height: 400vh; position: relative }
.work-sticky     { position: sticky; bottom: 0; min-height: 100vh }
.work-track-wrap { padding-left: 55%; display: flex }
.work-track      { flex-flow: row; flex: none; gap: 2.08vw }
```

That is a **400vh pinned section with a horizontally-scrubbed track** — vertical scroll drives horizontal card movement. My previous CSS Grid/subgrid rebuild threw that away, which is why it read as a different section. My own earlier note even recorded the 400vh pin as a "deviation"; it isn't a deviation, it's the whole section.

Rebuilt to the source DOM exactly:

```
section.work_section → .work-sticky → .work-container
  ├── .work-top-layout   (grid 1fr 1fr: label + h2 | intro copy)
  └── .work-track-wrap → .work-track → a.work-card ×9
        └── img.work-image + .work-image-overlay + .work-card-content
              ├── .work-card-content-top-layout    (index + label pills)
              ├── .work-card-content-bottom-layout (h3 + description)
              └── .work-card-arrow-wrap            (yellow FAB, 2-arrow slide)
```

GSAP isn't in this project's dependency tree, so the ScrollTrigger scrub is reimplemented in `useHorizontalPin.ts`: passive scroll listener that stores one number, geometry cached and re-measured only on resize/ResizeObserver, self-terminating rAF LERP, and a single compositor-only `translate3d` per frame. Below 768px and under `prefers-reduced-motion` the pin disables itself and falls back to a native scroll rail — which is exactly what the source's own 767px block does (`min-height:auto; position:static; overflow:scroll`).

**Content is now the source's, not yours** — as requested, nothing from the old projects section remains. All nine entries (1910.ai, SemiconBio, Happy Ring, PSSLTD, Lilipad, Omicron, Puck, Alosant, RAY AI) with their real copy and exact three-label stacks. Media points at the local `public/videos/*.webm`, never the Webflow CDN.

## 3. Navigation — it was the wrong object

The source's nav is a **fixed left sidebar**, `width: 18.54vw`, `position: fixed; inset: 0 auto 0 1.39vw`. That's why every section in the source carries `padding-left: 21vw`. I had built a floating bottom dock, which no amount of typographic tweaking would have reconciled.

Rebuilt with the source's four stacked blocks — `.nav-top-layout` (wordmark + socials), `.nav-stats-wrap` (stat cards + hairline separator), `.nav-menu` (chip-backed items), `.nav-button-wrap` (yellow CTA) — each over its own `backdrop-filter: blur(15px)` glass pane. Added `.nm-shell` to reserve the 21vw gutter, and the source's mobile behaviour (rail becomes a top bar; socials and stats hide).

The accessibility layer is kept and is *additive* — the source itself is unlabelled divs with `cursor: none`. Real `nav > ul > li > a`, `aria-current` driven by an IntersectionObserver scroll-spy, arrow/Home/End roving focus, and visible focus rings.

---

## How parity was verified

I could not do visual diffing: this sandbox blocks the Playwright Chromium download and direct network egress (TLS interception), so there is no browser to screenshot with.

Instead I fetched the source's live stylesheet and built a comparison harness (`/home/user/compare.js`) that parses both stylesheets, strips `@media` blocks so desktop base rules are compared like-for-like, resolves design-token aliases (`var(--accent)` ↔ `#ffff23`), and diffs every source declaration against mine property-by-property. Iterated until the numbers stopped moving:

| Selector group | Pass 1 | Final |
| --- | --- | --- |
| Projects section (19 selectors, 108 declarations) | 69.4% | **97.2%** |
| Navigation (17 selectors, 151 declarations) | 80.8% | **98.7%** |

That loop caught real bugs I would otherwise have shipped: the source puts the menu item's typography and box metrics on `.nav-menu-item`/`.nav-item-bg` rather than on the link, `.nav-logo` uses longhand padding with `justify-content: center`, and `.nav-button` is a fixed `3.47vw` tall rather than `100%`.

The handful of remaining diffs are deliberate and documented in the CSS:
- **`.work-sticky` padding** — the source's `padding-left: 21vw` reserves *its* sidebar; that gutter now lives on `.nm-shell` at the page level, so repeating it here would double it.
- **Token aliases** — `var(--accent)` *is* `#ffff23`; the harness flags the spelling, not a value difference.

## Still worth your eyes

`next build` and `tsc --noEmit` are clean, and SSR output is confirmed correct (9 cards, right headings and label stacks, `aria-current` present). But **the scrub feel — pin engagement point, LERP damping, and where the last card comes to rest — is the one thing I could not observe**, only reason about. Please scroll through the Work section once; if the track feels too fast or too slow, the single knob is the `0.12` LERP factor in `useHorizontalPin.ts`.
