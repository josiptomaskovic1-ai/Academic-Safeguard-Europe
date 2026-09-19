# Motion

How this site moves, and the rules that keep it accessible, private and fast.

## Principles

1. **The base state is the finished state.** Every element's plain CSS is what it looks
   like when nothing is animating. Animations run *from* an offset state *to* that
   natural state with `backwards` fill. Nothing is ever hidden waiting for a class that
   JavaScript has to add, so the site is complete with JavaScript off, in print, in a
   headless screenshot and after a back/forward restore.
2. **Yellow is a marker pen.** The signal colour underlines, highlights, wipes and
   stamps. It marks procedure and position. It is never ambient decoration.
3. **No bounce, no elastic, no wobble, no confetti.** The subject is abuse of academic
   power and retaliation against students. Motion here is decisive, not playful-cute.
4. **Each section moves in its own way.** One generic fade-up applied everywhere is the
   tell of a template, so no two homepage sections share an entrance.
5. **Two registers.** Campaign pages (Home, Problem, Demands, Take Action, About, 404)
   are expressive. Research pages (Evidence, Europe, countries, institutions, compare,
   Standard, methodology, sources, data, corrections) get 150–250 ms state feedback
   only. Nothing celebratory goes near a finding or a score.
6. **Motion is never the only carrier of meaning.** Anything a movement says is also
   said in text or in the static layout.

## Tokens

Defined once at the top of `src/styles/motion.css`.

| Token | Value | Use |
| --- | --- | --- |
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances: travels far, settles hard |
| `--ease-out-quart` | `cubic-bezier(0.25, 1, 0.5, 1)` | UI feedback and page transitions |
| `--dur-press` | `120ms` | Press / active feedback |
| `--dur-ui` | `220ms` | Hover, focus, fill wipes |
| `--dur-reveal` | `600ms` | Section reveals |
| `--dur-hero` | `800ms` | The homepage headline only |
| `--stagger` | `60ms` | Default gap between items in a sequence |
| `--dur-ui-out` | `165ms` | Exit ≈ 75% of `--dur-ui` |
| `--dur-reveal-out` | `450ms` | Exit ≈ 75% of `--dur-reveal` |

Layers are semantic, never `999`: `--z-base`, `--z-spotlight`, `--z-raised`,
`--z-menu`, `--z-header`, `--z-progress`.

## Guards

- `@media (prefers-reduced-motion: reduce)` in `global.css` already disables every
  transition and animation. `motion.css` adds what that rule cannot reach: view
  transitions, `animation-timeline`, and `view-transition-name`.
- `@media print` disables animation and hides the marquee, progress bar and spotlight.
- **A CSS rule cannot stop the Web Animations API.** Every JavaScript effect therefore
  checks `matchMedia('(prefers-reduced-motion: reduce)')` itself, listens for changes,
  and renders its final state instantly when motion is unwelcome.
- Scroll-driven effects live only inside `@supports (animation-timeline: view())`.
  Browsers without it get the static layout, which is already correct.
- JS reveals use `IntersectionObserver`, run once, unobserve, and carry a ~1200 ms
  failsafe timer, following the pattern established in `ProtectiveField.astro`.

## Security constraints these animations respect

`npm run check-security` enforces the CSP and bans the DOM sinks. Motion code therefore
uses `createElement` and `textContent` only — never `innerHTML`, `insertAdjacentHTML`,
`document.write`, `eval`, `new Function` or string timers. Markup that can be built at
build time is built in Astro. No CDN, no remote font, no `fetch`, no `data:` URI.
`style` attributes carry custom properties such as `style="--i: 3"` and nothing else.

## Animation table

| Page / scope | Element | Trigger | Duration | Easing | How | Reduced motion |
| --- | --- | --- | --- | --- | --- | --- |
| Site | `::view-transition-old(root)` | Navigation | 150 ms | `--ease-out-quart` | CSS `@view-transition` | Disabled |
| Site | `::view-transition-new(root)` | Navigation | 280 ms | `--ease-out-quart` | CSS `@view-transition` | Disabled |
| Site | `.site-header` | Navigation | — | — | `view-transition-name`, held still | Name removed |
| Home | `.ss-mark` | Load | 160 ms | `--ease-out-quart` | CSS `stamp-in`, scale 0.92→1 | Static mark |
| Home | `.ss-dots` | Load | 500 ms then out | steps | CSS, gated by `hero.ts` | Never rendered |
| Home | `.ss-word` | Load + 560 ms | 140 ms | `--ease-out-quart` | CSS `word-in` | Visible immediately |
| Home | `#hero-title` words | Load | 800 ms, 70 ms stagger | `--ease-out-expo` | CSS `word-rise` behind a mask | Static headline |
| Home | `.m-hero .m-bar` | Load + 900 ms | 420 ms | `--ease-out-quart` | CSS `bar-draw`, `background-size` 0→100% | Full underline |
| Home | `.m-hero-foot::before` | Load + 220 ms | 500 ms | `--ease-out-quart` | CSS `rule-draw`, `scaleX` | Full rule |
| Home | `.m-lede`, hero CTAs | Load + 260–380 ms | 420 ms | `--ease-out-expo` | CSS `rise-in` | Visible immediately |

The hero sequence finishes at 1.32 s. The lede and both buttons are fully opaque by
700 ms and are clickable for the whole sequence, because nothing clips or overlays them.
The `h1` is the LCP element and starts at 0 ms.


### Homepage sections

| Element | Trigger | Duration | Easing | How | Reduced motion |
| --- | --- | --- | --- | --- | --- |
| `.mq-track` | Load | 40 s loop | linear | CSS `mq-scroll`, duplicated track at −50% | Static, control removed |
| `.mq-toggle` | Click | 220 ms | `--ease-out-quart` | CSS; `marquee.ts` owns the state | Not rendered |
| `.m-statement .sw` | Scroll | scroll-linked | linear | `view-timeline`, per-word `animation-range` from `--i` | Fully inked |
| `.m-statement .m-bar` | Scroll | scroll-linked | linear | `view-timeline`, `background-size` | Full underline |
| `.m-art-num` | In view | 180 ms, 90 ms stagger | `--ease-out-quart` | CSS `stamp-num`, scale 1.15 → 1 | Static |
| `.m-articles li::before` | In view | 420 ms | `--ease-out-quart` | CSS `rule-draw`, `scaleX` | Full rule |
| `.m-dem-num > span` | In view | 700 ms, 110 ms stagger | `--ease-out-expo` | CSS `word-rise` behind a mask | Static |
| `.m-cell` | In view | 260 ms, 16 ms per cell | `--ease-out-quart` | CSS `cell-in` | Static |
| `.m-cell[data-on]::before/after` | In view | 900 ms ×2 | `--ease-out-quart` | CSS `ring`, exactly two, then stop | Not shown |
| `.m-scope-num` copy | In view | 900 ms | quartic out | `reveal.ts`, `textContent` on an aria-hidden copy | Final number at once |
| `.m-triad > span` | In view | 520 ms, 150 ms stagger | `--ease-out-quart` | CSS `wipe-in`, `clip-path` | Static |

### Site-wide

| Element | Trigger | Duration | Easing | How | Reduced motion |
| --- | --- | --- | --- | --- | --- |
| `.btn-primary::before` | Hover / focus-visible | 220 ms | `--ease-out-quart` | CSS `scaleX` fill wipe | No wipe |
| `.btn` | Press | 120 ms | `--ease-out-quart` | CSS `--press: 0.97` | No scale |
| `[data-magnetic]` | Pointer move | ≤6 px, 400 ms back | `--ease-out-quart` | `pointer.ts` writes `--mx`/`--my` | Disabled |
| `.m-more span` | Hover / focus-visible | 350 ms | `--ease-out-quart` | CSS `arrow-cycle`, out right, in from left | Static |
| `.m-more::after` | Hover / focus-visible | 220 ms | `--ease-out-quart` | CSS `scaleX` rule redraw | Static |
| `.nav a::after` | Hover / focus-visible | 220 ms | `--ease-out-quart` | CSS `scaleX` from the left | Static |
| `.mark-bar` | Hover | 220 ms | `--ease-out-quart` | CSS `scaleX(1.35)`, `transform-box: fill-box` | Static |
| `.reading-progress` | Scroll | scroll-linked | linear | `animation-timeline: scroll(root)` | `display: none` |
| `section.on-navy::before` | Pointer move | 220 ms fade | `--ease-out-quart` | `pointer.ts` writes `--sx`/`--sy` | `display: none` |
| `.nav[data-open]` | Menu toggle | 240 ms | `--ease-out-quart` | CSS `clip-path` + `@starting-style` | Instant |
| `.nav li` | Menu open | 260 ms, 30 ms stagger | `--ease-out-quart` | CSS `nav-item` | Static |
| `.nav-toggle svg path` | Menu toggle | 220 ms | `--ease-out-quart` | CSS opacity + rotate morph | Instant swap |

### Inner pages

| Page | Element | Trigger | Duration | Easing | How | Reduced motion |
| --- | --- | --- | --- | --- | --- | --- |
| Problem | `.ad-lines path` | In view | 400 ms, 120 ms stagger | `--ease-out-quart` | CSS `draw-line`, `pathLength="1"` | Drawn |
| Problem | `.ad-labels > g` | In view | 300 ms, after its line | `--ease-out-quart` | CSS `rise-in` | Static |
| Problem | `.ad-complaint path` | In view | 1200 ms × 3 | linear | CSS `dash-flow`, 3.6 s total | Static dashes |
| Problem | `.ad-node--staff rect` | In view + 1.5 s | 620 ms, once | `--ease-out-quart` | CSS `node-note`, stroke width | Static |
| Europe | `.tilemap li` | In view | 300 ms, `--d` from grid distance to HR | `--ease-out-quart` | CSS `cell-in`; delay computed at build time, capped 600 ms | Static |
| Take Action | `.jump-tiles a::before` | Hover / focus-visible | 220 ms | `--ease-out-quart` | CSS `scaleY` from the bottom | Static |
| Take Action | `.copy-check path` | Copy | 260 ms | `--ease-out-quart` | CSS `draw-line` | Check shown at once |
| Records | `.score-pips i.on` | In view | 200 ms, 70 ms stagger | `--ease-out-quart` | CSS `pip-in` | Filled |
| Records | `.matrix details` | Toggle | 220 ms | `--ease-out-quart` | `interpolate-size` + `::details-content` | Snaps, as before |
| Records | `.matrix .chev` | Toggle | 220 ms | `--ease-out-quart` | CSS rotate | Static |
| 404 | `.lost-dots i` | Load | 1400 ms loop | steps | CSS `dot-blink` | Static dots |

## The one loop on the site

The 404 typing dots are the only animation that repeats forever. They sit on a page
with nothing to read and a way out, they are `aria-hidden`, and they carry no
meaning. Everything else that repeats — the marquee — has a pause control, and
everything else that plays does so once.

## What is deliberately still

Nothing celebratory goes near a finding, a score or a verification label. Research
pages get state feedback only: an edge colour on a tile, pips filling in order, an
accordion that opens smoothly. The one exception is the Europe ripple, because the
delay *is* the information: research started in Croatia and spreads outward from it.

## Testing notes

- axe-core: 0 violations on `/`, `/problem/`, `/demands/`, `/europe/`, `/evidence/`,
  `/take-action/`, `/about/`, `/countries/croatia/`, `/institutions/hr-unizg/` and
  `/standard/`.
- No horizontal overflow at 1920, 1440, 1280, 820, 390 or 320 px.
- Reduced motion, print and JavaScript-disabled each render the complete page.
- Shipped JavaScript: about 4.6 KB gzipped across the whole site.

### The headline mask

`.m-hero h1` has `line-height: 0.88`, so a plain `overflow: hidden` mask cuts ascenders
and descenders (`p`, `f`, `d`, `g`). `.hw` therefore grows its clip box with
`padding: 0.2em 0.04em 0.26em` and pulls it back with an equal negative margin, so the
region clears the glyphs without moving a pixel of layout. Verified mid-animation on
"power" and "safeguards.".

### Reading order

The headline is split into words at build time in Astro, never in the browser. The full
sentence lives once in a `.visually-hidden` span; the split words sit in an
`aria-hidden` span. A screen reader reads the heading exactly once, and `id="hero-title"`
is unchanged, so `aria-labelledby` still resolves.
