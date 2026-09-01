# 007 — Bleed the post rail to the screen edge and fade the edge it clips

- **Commit:** f7f4cf7
- **Status:** DONE
- **Severity:** MEDIUM
- **Category:** 7 (cohesion, hierarchy & spatial consistency)
- **Estimated scope:** 4 files, ~90 lines

## Problem

The related-posts rail is left-aligned to the page column and pulled right by
exactly one gutter (`-mr-(--spacing-gutter)`). Above the container cap
(`--max-width-content-default: 96rem`) the column stops centering on the
viewport, so that single gutter no longer reaches anything: the rail hard-clips
mid-page, and the cut card — the only thing telling the reader the list
continues, since the rail carries no arrows — ends on a knife edge that reads as
a rendering seam rather than as content running off the screen.

The house already answers this on its native rails: `scroll-fade-x` with
`-mx-gutter`, on the AudienceTabs tab rail
(`src/blocks/AudienceTabs/Component.tsx:31`) and the InsightsBrowse topic rail
(`src/sections/InsightsBrowse/index.tsx:34`), which "dims only the edge that
still has content behind it". That utility cannot be used here as-is: it rides
`animation-timeline: scroll(self inline)`, and embla never scrolls — it
translates its track, so the viewport's `scrollLeft` sits at 0 forever and the
timeline never advances.

## Where

| File | Lines | What's there |
| --- | --- | --- |
| `src/sections/RelatedPosts/PostRail.client.tsx` | 39, 51–118 | `TRACK_GUTTER`; the `.container` shell and the one-gutter bleed |
| `src/app/(frontend)/globals.css` | 145–168, 328–350, 875–889 | `@property --scroll-fade-*`, `@utility scroll-fade-x`, the `container` family |
| `src/blocks/Carousel/use-carousel-effects.ts` | 100–150 | The exemplar: embla `scroll` → direct style writes |

### Current code

```tsx
// src/sections/RelatedPosts/PostRail.client.tsx:39
const SLIDE_GUTTER = 'px-8'
const TRACK_GUTTER = '-mx-8'
```

```tsx
// src/sections/RelatedPosts/PostRail.client.tsx:57
    <ScrollReveal as="div" className="container" variant="underMedia">
      <div className="mb-16 flex items-start justify-between gap-8 border-t border-border pt-8">
```

```tsx
// src/sections/RelatedPosts/PostRail.client.tsx:94
      {isCarousel ? (
        // The rail runs past the page column's right edge: the cut card sits in
        // the gutter rather than a hand's width inside it, so the list reads as
        // continuing off the page. The left edge stays on the column.
        <div className="-mr-(--spacing-gutter)">
          <Carousel
            aria-label="More insights"
            opts={{
              align: 'start',
              containScroll: 'trimSnaps',
            }}
          >
            <CarouselContent className={TRACK_GUTTER}>
```

## Target

Three pieces: a container utility that starts on the page column and ends at the
screen, a mask utility for a rail that is dragged rather than scrolled, and a
hook that feeds the mask from embla's own scroll position.

### 1. `src/app/(frontend)/globals.css` — beside the `container` family (after `container-full`, ~line 892)

```css
/*
 * A rail that starts on the page column and runs off the end of the screen —
 * the clipped card sits in the browser's edge, not a hand's width inside it.
 *
 * The start padding reproduces `container`'s own inset without a viewport
 * unit: percentage padding resolves against the containing block, so on a
 * full-width parent `100%` is the document's content width and
 * `(100% - max-width) / 2 + gutter` lands exactly where the page column
 * starts; `max()` collapses it to the plain gutter below the cap. `100vw`
 * would overshoot by half the scrollbar space `html` reserves with
 * `scrollbar-gutter: stable` and hang a horizontal scrollbar off the page.
 *
 * Requires a full-width parent — a sibling of `.container`, never a child.
 */
@utility container-bleed-e {
  width: 100%;
  padding-inline-start: max(
    var(--spacing-gutter),
    calc((100% - var(--max-width-content-default)) / 2 + var(--spacing-gutter))
  );
}
```

### 2. `src/app/(frontend)/globals.css` — with the scroll-fade family, after `@utility scroll-fade-e` (~line 529)

```css
/* drag-fade: the scroll-fade mask for a rail that is dragged, not scrolled. */
@property --drag-fade-ks {
  syntax: "<number>";
  inherits: false;
  initial-value: 0;
}
@property --drag-fade-ke {
  syntax: "<number>";
  inherits: false;
  initial-value: 1;
}

/*
 * Same mask and the same `--scroll-fade-s/-e` properties as `scroll-fade-x`,
 * minus the scroll timeline. An embla viewport translates its track and its
 * own `scrollLeft` never moves, so `scroll(self inline)` would sit at progress
 * 0 forever. `useCarouselEdgeFade` writes the two 0..1 ramp factors from
 * embla's scroll position instead. The factors' initial values are the rest
 * state — start edge clear, end edge faded — so a server-rendered rail is
 * already right before that hook runs. Width is tuned with the shared
 * `scroll-fade-*` utility, exactly as on the native rails.
 */
@utility drag-fade-x {
  --drag-fade-size: var(--scroll-fade-size, calc(var(--spacing) * 16));
  --scroll-fade-s: calc(var(--drag-fade-size) * var(--drag-fade-ks));
  --scroll-fade-e: calc(var(--drag-fade-size) * var(--drag-fade-ke));
  --scroll-fade-mask: linear-gradient(
    to right,
    transparent 0,
    #000 var(--scroll-fade-s),
    #000 calc(100% - var(--scroll-fade-e)),
    transparent 100%
  );
  &:where([dir="rtl"], [dir="rtl"] *) {
    --scroll-fade-mask: linear-gradient(
      to left,
      transparent 0,
      #000 var(--scroll-fade-s),
      #000 calc(100% - var(--scroll-fade-e)),
      transparent 100%
    );
  }
  -webkit-mask-image: var(--scroll-fade-mask);
  mask-image: var(--scroll-fade-mask);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}
```

### 3. New file `src/components/ui/use-carousel-edge-fade.ts`

```ts
'use client'

import { useEffect } from 'react'
import type { CarouselApi } from '@/components/ui/carousel'

export const CAROUSEL_EDGE_FADE_DEFAULTS = {
  /**
   * Pan distance, in px, over which an edge fade grows from nothing to its
   * full width. Matches `--scroll-fade-reveal`'s default in globals.css
   * (`calc(var(--spacing) * 24)` = 6rem), so a dragged rail ramps in over the
   * same distance as the site's native scroll rails.
   */
  revealPx: 96,
} as const

/**
 * Drives the `drag-fade-x` mask on an embla viewport from embla's own scroll
 * position — the same single source of truth the block carousel's per-frame
 * writer uses (see `src/blocks/Carousel/use-carousel-effects.ts`), so the fade
 * can never lag or disagree with where the track actually is.
 *
 * Only the two 0..1 ramp factors are written; the mask's width stays in CSS.
 * Values are quantised to a hundredth and skipped when unchanged, so a frame
 * that lands on the same value does not repaint the mask.
 */
export function useCarouselEdgeFade(api: CarouselApi) {
  useEffect(() => {
    if (!api) return
    const viewport = api.rootNode()
    const { revealPx } = CAROUSEL_EDGE_FADE_DEFAULTS
    let lastStart = -1
    let lastEnd = -1

    const write = () => {
      const total = api.internalEngine().limit.length
      // Rubber-band overshoot puts progress slightly outside 0..1.
      const panned = Math.min(Math.max(api.scrollProgress(), 0), 1) * total
      const start = Math.round(Math.min(panned / revealPx, 1) * 100) / 100
      const end = Math.round(Math.min((total - panned) / revealPx, 1) * 100) / 100

      if (start !== lastStart) {
        viewport.style.setProperty('--drag-fade-ks', String(start))
        lastStart = start
      }
      if (end !== lastEnd) {
        viewport.style.setProperty('--drag-fade-ke', String(end))
        lastEnd = end
      }
    }

    write()
    api.on('scroll', write)
    api.on('reInit', write)

    return () => {
      api.off('scroll', write)
      api.off('reInit', write)
      viewport.style.removeProperty('--drag-fade-ks')
      viewport.style.removeProperty('--drag-fade-ke')
    }
  }, [api])
}
```

### 4. `src/sections/RelatedPosts/PostRail.client.tsx`

- `TRACK_GUTTER` becomes `-ms-8` (start only). Cancelling the *end* half too
  would land the last card dead against the browser edge at the final snap;
  keeping it leaves the slide's own 2rem as breathing room, and the left edge
  still sits flush on the page column. Update the constant's doc comment to say
  so.
- `ScrollReveal` loses `className="container"`; the heading row and the grid
  branch each gain `container`; the carousel branch's wrapper becomes
  `container-bleed-e` and loses `-mr-(--spacing-gutter)`.
- The component takes `const [api, setApi] = useState<CarouselApi>()`, passes
  `setApi={setApi}` to `<Carousel>` and calls `useCarouselEdgeFade(api)`.
- `<Carousel>` gains
  `className="scroll-fade-16 [&_[data-slot=carousel-content]]:drag-fade-x"`.
  The mask must land on the embla viewport, which is `CarouselContent`'s own
  `overflow-hidden` div and is not reachable through a prop — `CarouselContent`'s
  `className` goes to the inner flex track. `--scroll-fade-size` is unregistered
  and therefore inherits, so `scroll-fade-16` can sit on the parent.

Resulting carousel branch:

```tsx
        <div className="container-bleed-e">
          <Carousel
            aria-label="More insights"
            className="scroll-fade-16 [&_[data-slot=carousel-content]]:drag-fade-x"
            opts={{ align: 'start', containScroll: 'trimSnaps' }}
            setApi={setApi}
          >
            <CarouselContent className={TRACK_GUTTER}>
```

**Why these values**

- **`scroll-fade-16`** = `16 × --spacing` = **4rem / 64px**. The native rails use
  `scroll-fade-8` (32px), but those fade a row of pills ~40px tall; this edge
  runs the full height of a card, where a 32px ramp still reads as a cut. 64px
  is the first width that dissolves rather than trims. Feel-check it against 8
  and 24 before settling.
- **`revealPx: 96`** — `--scroll-fade-reveal`'s own default
  (`calc(var(--spacing) * 24)` = 6rem, `globals.css:245`). The dragged rail and
  the scrolled rails ramp over the same distance, so the two read as one system.
- **Ramp factors, not px** — the width lives once, in CSS, and the correct rest
  state (`ks: 0`, `ke: 1`) paints server-side before `api` even exists.
- **`api.rootNode()`** is exactly the `overflow-hidden` viewport div
  (`carousel.tsx:129`), so the hook and the CSS target the same node without a
  ref being threaded anywhere.

## Conventions to follow

- Tuning lives once, as an exported `*_DEFAULTS` object per effect — see
  `TESTIMONIALS_MARQUEE_DEFAULTS` in
  `src/blocks/TestimonialsMarquee/Marquee.client.tsx:19` and
  `docs/immersive-effects.md`. Never restate a default at a call site.
- `src/blocks/Carousel/use-carousel-effects.ts` is the exemplar for reading
  embla per frame and writing straight to the node — no React state in the loop
  (`rerender-use-ref-transient-values`). Match its structure and its
  `api.on(...)` / `api.off(...)` teardown.
- New utilities go in `src/app/(frontend)/globals.css` beside the family they
  extend, with the comment explaining the constraint that forced them — that is
  how `scroll-fade` and the `container` family are already written.
- Storybook: `src/sections/RelatedPosts/index.stories.tsx` already renders eight
  posts as `Default`. Verify against it; add a story only if a width case is
  missing.

## Steps

1. Add `@utility container-bleed-e` to `globals.css` after `container-full`.
2. Add the two `@property` registrations and `@utility drag-fade-x` after
   `@utility scroll-fade-e`.
3. Create `src/components/ui/use-carousel-edge-fade.ts` exactly as above.
4. Rework `PostRail.client.tsx`: `TRACK_GUTTER` → `-ms-8` with an updated
   comment; move `container` off `ScrollReveal` and onto the heading row and the
   grid branch; swap the carousel wrapper to `container-bleed-e`; add the
   `useState` + `setApi` + `useCarouselEdgeFade` wiring and the `Carousel`
   className.
5. Rewrite the carousel branch's leading comment to describe the new geometry —
   left on the column, right off the screen, fade only on the side that still
   has cards behind it.
6. `pnpm biome check --write` on the touched files.

## Out of scope

- `src/components/ui/carousel.tsx`. No change is needed and the file's own
  comments say divergence from the shadcn registry is deliberate-only.
- `src/blocks/Carousel/*` — the block carousel is centre-aligned with symmetric
  peeks by documented design (`Component.tsx:41–66`). Do not left-align it and do
  not give it this fade.
- The slide bases (`SLIDE_BASIS`), `SLIDE_GUTTER`, `GRID_GAP`, `CAROUSEL_MIN_COUNT`,
  and the heading row's own layout.
- `useClickableCard` and the press behaviour — plan 006 owns those.
- Do not add a `prefers-reduced-motion` branch: the mask is a static affordance
  whose width tracks position, not an animation, and none of the `scroll-fade`
  utilities gate on it.

## Verification

**Build**

- [ ] `pnpm exec tsc --noEmit` and `pnpm biome check` pass.
- [ ] Storybook `Sections/RelatedPosts` → `Default` and `Grid` both render.

**Behavior**

- [ ] At ≥ 1600px wide: the first card's left edge lines up with the heading
      above it, and the rail runs to the browser's right edge — not to the
      column's.
- [ ] Below the cap (e.g. 1200px and 390px): the left edge still lands on the
      page gutter; nothing is indented differently from today.
- [ ] **No horizontal page scrollbar at any width.** This is the failure mode a
      `100vw` bleed would have had; check 1440, 1600 and 2560 in a browser whose
      scrollbar takes layout space.
- [ ] At rest the right edge is faded and the left is clean. Drag right and the
      left fade ramps in over ~96px of pan. At the final snap the right fade is
      gone and the last card sits ~2rem off the screen edge.
- [ ] The `Grid` story (3 posts) is unchanged — still a three-column grid inside
      the page column.
- [ ] Click a card and let the shared-element transition run: the post image must
      morph into `PostHero` **without** being clipped or ghosted by the mask.
      Masks create a stacking context, and this is the one place this change
      could break something invisible in a static screenshot. Test a card sitting
      under the fade, not just one in the clear.

**Feel**

- [ ] Record a full drag and scrub it. The fade should feel attached to the
      gesture — appearing as content goes under it, not switching on. If it
      pops, the 96px ramp is too short for the card width at that breakpoint.
- [ ] Drag on a real phone: the fade must not stutter. If it does, the mask is
      repainting too often — widen the quantisation in `write()` from a
      hundredth to a twentieth before reaching for `will-change`.
- [ ] Compare the edge against the testimonials marquee's fades
      (`Marquee.client.tsx:118–128`) side by side. They should read as the same
      device turned ninety degrees; if 64px looks thin next to them, try
      `scroll-fade-24`.

## Notes

Whether the fade should scrub with the drag (this plan) or simply cross-fade in
and out at the ends is a taste call the code cannot settle. Scrubbing was chosen
because it matches what the native rails already do — their fade rides a scroll
timeline — and because the request was explicitly for an edge treatment oriented
by the drag. If it reads as busy in motion, the cheaper alternative is to drive
the same two factors from `canScrollPrev` / `canScrollNext` and let CSS transition
them over 200 ms; the CSS above needs no change for that.

`embla`'s `limit.length` is the total pannable distance in px
(`embla-carousel.esm.js:213`); it is 0 when the rail does not overflow, which
zeroes both fades. With `CAROUSEL_MIN_COUNT = 4` and the widest basis at
`1/3.5`, that case should not occur, but the hook handles it rather than dividing
by it.

## As built

Two departures from the plan, both found by measuring the result in a browser.

**1. `TRACK_GUTTER` is `-ml-8`, not `-ms-8`.** `CarouselContent` hardcodes `-ml-4`
on the track and merges the caller's class through `cn`. tailwind-merge treats
`ms-*` and `ml-*` as different properties, so `-ms-8` did not displace `-ml-4` —
both were emitted, the cascade kept `-ml-4`, and only 16 px of the slide's 32 px
gutter was cancelled. The first card sat 16 px right of the page column. `-ml-8`
is recognised as the same property and replaces it outright.

This was a pre-existing defect, not one this plan introduced: the old `-mx-8`
lost the same conflict. It is a large part of the "the rail is not aligned with
the rest of the site" complaint that prompted the audit.

**2. The fade carries its own responsive width; the call site sets none.**
`scroll-fade-16` (a flat 64 px) read as a trim rather than a dissolve at desktop
width, and a flat pixel value would have eaten a third of a 390 px screen. The
`drag-fade-x` default is now `min(12%, calc(var(--spacing) * 32))` — the same
shape as `scroll-fade`'s own `min(12%, 40px)` default with a cap sized for a
card rail (128 px). `scroll-fade-*` still overrides it at a call site.

### Measured (Storybook `Sections/RelatedPosts`, Playwright)

At 390 / 800 / 1200 / 1440 / 1800 / 2560 px wide:

- First card's content edge and the heading's left edge differ by **0 px**.
- The embla viewport's right edge equals the document's right edge exactly
  (1785 px of 1785 px at a 1800 px viewport — the 15 px difference from
  `clientWidth` is the scrollbar space `scrollbar-gutter: stable` reserves).
- `documentElement.scrollWidth` never exceeds `clientWidth` — no horizontal
  scrollbar at any width.
- Rest state `--drag-fade-ks: 0` / `--drag-fade-ke: 1` (right faded, left clean);
  mid-rail both `1`; at the last snap `1` / `0` (left faded, right clean).
- Last card's content stops 32 px short of the screen edge at the final snap —
  the slide's own end gutter, kept by the `-ml-*`-only cancel.
- Motion-enabled pass: all 32 `[data-reveal]` targets in the rail settle to
  opacity 1 and the media frames' `clip-path` resolves to `none`, so moving
  `container` off the `ScrollReveal` root did not disturb the entrance.

### Still unverified

The shared-element morph from a card into `PostHero` was not exercised — it needs
a real post route and a database, not a story. The mask on the viewport creates a
stacking context, so check a card sitting under the fade before considering this
closed.
