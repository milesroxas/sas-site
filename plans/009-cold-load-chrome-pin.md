# 009 — Paint the fixed bars on the hero band's palette before hydration

- **Status**: DONE, merged to `main` as c777a15 and deployed 2026-09-09; production frame check passed (header `transparent=true` from the first frame in light and dark, no opaque frame across the hydration handover)
- **Commit**: ea73161
- **Severity**: HIGH on the light site theme, MEDIUM on dark
- **Category**: Cohesion, hierarchy & spatial consistency (a state that arrives from nowhere)
- **Estimated scope**: 6 files, ~70 lines (1 new hook, 1 new test, CSS selector edit, 2 bar shells, HeroBand prop, home hero opt-in, 1 doc sentence)

## Problem

On a cold document load the header and footer are server-rendered on the
site theme: an opaque `bg-background` plate and the site theme's ink. The
hero band under them is always dark. Only when the bundle hydrates does
`HeroBand`'s layout effect write the ChromeTheme store, which re-renders the
bars pinned to the band (`data-theme="dark"`, `bg-transparent`) and lets
their existing 300ms `transition-[height,background-color,color]` fade the
plate away. So every first paint shows the wrong chrome, and the correction
plays as a visible fade at a moment the visitor did not cause.

Measured on production (`preview.suits-sandals.com`, Playwright, sampling
computed styles per animation frame from navigation commit):

| Run | First paint | Bars re-pinned (hydration) | Window with the wrong chrome |
| --- | --- | --- | --- |
| dark scheme, unthrottled | 196ms | 511ms, plate fades to transparent by 831ms | ~0.3s + a 300ms fade |
| light scheme, 4x CPU + ~1.6Mbps | 1657ms | 9452ms | ~7.8s of a white bar with dark ink over the dark hero, then a fade |

Light is the default site theme (`defaultTheme = 'light'` in
`src/providers/Theme/shared.ts`), so a visitor without an OS dark preference
gets the white-plate version. Plan 010 (the cold-load hero intro) fades the
bars' *contents* in as part of the entrance; without this plan the plate
itself still snaps at hydration, so 009 runs first.

## Where

| File | Lines | What's there |
| --- | --- | --- |
| `src/Header/HeaderBar.tsx` | 24–37 | Fixed header shell; reads the pin from the store, `bg-transparent` only when pinned or menu open |
| `src/Footer/FooterBar.tsx` | 22–35 | Fixed footer shell; same pattern |
| `src/heros/HeroBand.tsx` | 135–157 | Band root: stamps `data-theme`, runs the scroll-derived pin |
| `src/app/(frontend)/globals.css` | 1166–1215 | The `[data-theme="dark"]` token block |
| `src/Home/hero/index.tsx` | 101–104 | The home hero's `HeroBand` (pulls under the header with `-mt-(--header-height)`) |
| `src/providers/ChromeTheme/index.tsx` | 100–103 | `useChromeBarTheme`: `getServerSnapshot` returns `null`, which is why the SSR bars are on the site theme |

### Current code

```tsx
// src/Header/HeaderBar.tsx:24
  const heroTheme = useChromeBarTheme('header')
  const pinned = menuOpen ? null : heroTheme
  return (
    <header
      data-site-header
      data-theme={pinned ?? undefined}
      className={cn(
        'fixed inset-x-0 top-0 z-50 h-(--header-bar-height) text-foreground transition-[height,background-color,color] duration-300 motion-reduce:transition-none',
        menuOpen || pinned ? 'bg-transparent' : 'bg-background',
      )}
```

```tsx
// src/Footer/FooterBar.tsx:22
  const heroTheme = useChromeBarTheme('footer')
  return (
    <footer
      data-site-footer
      data-theme={heroTheme ?? undefined}
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 h-(--footer-bar-height) text-foreground transition-[height,background-color,color] duration-300 motion-reduce:transition-none',
        heroTheme ? 'bg-transparent' : 'bg-background',
      )}
```

```tsx
// src/heros/HeroBand.tsx:135
type HeroBandProps = React.HTMLAttributes<HTMLElement> & {
  /** Root element; heroes are landmarks or sections, never anonymous boxes by default. */
  as?: 'div' | 'header' | 'section'
  /** The band's own palette. Pinned on the element and mirrored onto the chrome above it. */
  theme?: Theme
}
// ...
export const HeroBand: React.FC<HeroBandProps> = ({
  as = 'section',
  theme = 'dark',
  children,
  ...props
}) => {
  const ref = useRef<HTMLElement>(null)
  useHeroChromeTheme(ref, theme)
  return createElement(as, { ...props, 'data-theme': theme, ref }, children)
}
```

```css
/* src/app/(frontend)/globals.css:1166 */
/* Dark palette from the shadcn preset (b1ZzraCdE), keyed to the site's
   data-theme mechanism instead of the stock `.dark` class. */
[data-theme="dark"] {
  --background: oklch(0.145 0 0);
  /* ... ~45 token declarations ... */
}
```

```tsx
// src/Home/hero/index.tsx:101
    <HeroBand
      // Pull under the fixed header; stop at the fixed footer so the first
      // screen is exactly header + hero + footer (page frame already pads the bottom).
      className="relative isolate -mt-(--header-height) flex h-[calc(100svh-var(--footer-height))] flex-col overflow-clip bg-background text-foreground"
    >
```

## Target

CSS paints the bars exactly as the store will pin them, from the first
frame, and hands over to the store the moment it is live. No token value is
restated: the dark palette block gains a second selector, and one extra rule
makes the plate transparent. The handover is an attribute the bars stamp
only after hydration, via `useSyncExternalStore`, so server and client
markup still match.

Which bands opt in: only a band that sits under both bars at rest. The home
hero does (`-mt-(--header-height)`, full first screen). `MediumImpact`
starts below the header and must not opt in. `HighImpact` and `SegmentHero`
also pull under the header and can opt in later with the same one prop, but
verifying them is outside this plan.

### 1. New hook `src/hooks/use-hydrated.ts`

```ts
'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

/**
 * `false` for the server render and the hydration render, `true` on every
 * client render after that. `useSyncExternalStore` re-renders with the
 * client snapshot once hydration has committed, so server and client markup
 * still match and the flip lands in the same paint as the first effects.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
```

House exemplar for the shape: `src/hooks/use-prefers-reduced-motion.ts`.

### 2. Bars stamp `data-chrome-live` once hydrated

```tsx
// src/Header/HeaderBar.tsx — target
  const heroTheme = useChromeBarTheme('header')
  // Until this is set, globals.css paints the bar on a hero band's palette
  // (`data-hero-band-pin`); after it, the store above is the only writer.
  const live = useHydrated()
  const pinned = menuOpen ? null : heroTheme
  return (
    <header
      data-site-header
      data-chrome-live={live ? '' : undefined}
      data-theme={pinned ?? undefined}
```

Same three lines in `FooterBar.tsx` (`data-chrome-live={live ? '' : undefined}`
next to `data-site-footer`). Import `useHydrated` from `@/hooks/use-hydrated`.
Do not change the class lists or the transition.

### 3. `HeroBand` opt-in prop

```tsx
// src/heros/HeroBand.tsx — target
type HeroBandProps = React.HTMLAttributes<HTMLElement> & {
  /** Root element; heroes are landmarks or sections, never anonymous boxes by default. */
  as?: 'div' | 'header' | 'section'
  /** The band's own palette. Pinned on the element and mirrored onto the chrome above it. */
  theme?: Theme
  /**
   * The band sits under both fixed bars at rest (it pulls under the header
   * and fills the first screen), so the bars should already be on its
   * palette at first paint: stamps `data-hero-band-pin`, which globals.css
   * uses to paint the bars before the ChromeTheme store can (the store is
   * written from this band's effect, after hydration). Never set it on a
   * band that starts below the header: a pinned plate over any sliver of
   * page carries the wrong ink.
   */
  pinsChromeAtLoad?: boolean
}

export const HeroBand: React.FC<HeroBandProps> = ({
  as = 'section',
  theme = 'dark',
  pinsChromeAtLoad = false,
  children,
  ...props
}) => {
  const ref = useRef<HTMLElement>(null)
  useHeroChromeTheme(ref, theme)
  return createElement(
    as,
    {
      ...props,
      'data-theme': theme,
      ...(pinsChromeAtLoad ? { 'data-hero-band-pin': theme } : {}),
      ref,
    },
    children,
  )
}
```

`pinsChromeAtLoad` must be destructured out so it never reaches the DOM.

### 4. CSS: the palette selector and the plate rule

Replace the comment and selector that open the dark token block:

```css
/* Dark palette from the shadcn preset (b1ZzraCdE), keyed to the site's
   data-theme mechanism instead of the stock `.dark` class.

   The second selector paints the same palette onto the fixed bars before
   hydration while a hero band that sits under them at rest asks for it
   (`pinsChromeAtLoad`, src/heros/HeroBand.tsx). The ChromeTheme store that
   pins the bars cannot write until that band's effect runs, so the
   server-rendered bars would otherwise carry the site theme's ink and plate
   over the band for the whole pre-hydration window and then fade. This puts
   them on the band's palette from the first frame; `data-chrome-live`
   (HeaderBar / FooterBar, stamped once hydrated) hands them to the store
   with nothing left to change. The plate half is the rule after the block. */
[data-theme="dark"],
:root:has([data-hero-band-pin="dark"])
  :is([data-site-header], [data-site-footer]):not([data-chrome-live]) {
  --background: oklch(0.145 0 0);
```

Leave every declaration inside the block untouched. Immediately after the
block's closing brace (currently line 1215, before the `[data-band="dark"]`
comment), add:

```css
/* Pre-hydration chrome pin, plate half: the store's pinned state is a
   transparent plate (`bg-transparent` in HeaderBar / FooterBar) so the band's
   media runs under the bar. Match it for the same window. Unlayered on
   purpose: it has to beat the `bg-background` utility the bars render with. */
:root:has([data-hero-band-pin])
  :is([data-site-header], [data-site-footer]):not([data-chrome-live]) {
  background-color: transparent;
}
```

`:root:has(...)` already has precedent in this codebase
(`view-transition.css`, `:root:has([data-page-frame][inert])`).

### 5. Home hero opts in

```tsx
// src/Home/hero/index.tsx — target
    <HeroBand
      // Pull under the fixed header; stop at the fixed footer so the first
      // screen is exactly header + hero + footer (page frame already pads the bottom).
      className="relative isolate -mt-(--header-height) flex h-[calc(100svh-var(--footer-height))] flex-col overflow-clip bg-background text-foreground"
      pinsChromeAtLoad
    >
```

### 6. Docs

In `docs/animations.md`, in the **Shared foundations** bullet that begins
"**The fixed chrome follows the hero band under it, and nothing else sets
it.**", append this sentence at the end of the bullet:

> Before hydration the store has no writer, so a band that sits under both bars at rest opts into `pinsChromeAtLoad` and globals.css paints the bars on its palette from the first frame (the dark token block's second selector plus the transparent-plate rule after it); the bars stamp `data-chrome-live` once hydrated, which hands them to the store with nothing left to change.

**Why these values:** none are new. The tokens are the existing dark palette,
applied to two more elements for a bounded window; the plate value is the
same `transparent` the bars already use when pinned.

## Conventions to follow

- `useSyncExternalStore` for anything that must differ between server and
  client renders: `src/hooks/use-prefers-reduced-motion.ts`.
- Bars own their attributes and class lists; bands own `data-*` stamps:
  `src/heros/HeroBand.tsx` (`data-theme`).
- Comments explain *why* at the site of the rule; no em dashes anywhere
  (code comments, CSS, docs, commit message): recast with a comma, colon or
  period.
- Biome formats CSS with `tailwindDirectives`; run `pnpm lint` after editing
  `globals.css`.

## Steps

1. Add `src/hooks/use-hydrated.ts` as above.
2. In `src/Header/HeaderBar.tsx` and `src/Footer/FooterBar.tsx`, import the
   hook, call it, and stamp `data-chrome-live` as shown. Nothing else changes.
3. In `src/heros/HeroBand.tsx`, add the `pinsChromeAtLoad` prop, destructure
   it, and stamp `data-hero-band-pin={theme}` when set.
4. In `globals.css`, extend the dark block's selector and add the plate rule
   after the block. Keep the existing comment's first two lines verbatim.
5. Pass `pinsChromeAtLoad` on the home hero's `HeroBand`.
6. Tests. In `src/heros/HeroBand.test.tsx` add a `describe('pinsChromeAtLoad')`
   with three cases: no prop renders no `data-hero-band-pin`; the prop renders
   `data-hero-band-pin="dark"` by default; `theme="light"` with the prop renders
   `"light"`. Add `src/Header/HeaderBar.test.tsx` (mirror the harness style of
   `src/heros/HeroBand.test.tsx`: `@testing-library/react` + vitest) asserting a
   client render of `<HeaderBar menuOpen={false}>x</HeaderBar>` produces a
   `header` with `data-chrome-live` and no `data-theme`. Same for `FooterBar`
   if a test file for it is cheap to add; otherwise skip it and say so.
7. Append the docs sentence.
8. `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test:int` (or
   `pnpm exec vitest run --config ./vitest.config.mts src/heros src/Header`).

## Out of scope

- Do not change `useChromeBarTheme`, the store, or `useHeroChromeTheme`.
- Do not opt `HighImpact`, `SegmentHero` or `MediumImpact` in; note them as
  follow-ups.
- Do not touch the `[data-band="dark"]` block, the light `:root` token block,
  or the `html { opacity: 0 }` guard at the end of `globals.css`.
- Do not change the bars' transition or class lists beyond the new attribute.
- No new dependencies, no migrations (no schema change in this plan).

## Verification

**Build**
- [ ] `pnpm exec tsc --noEmit` and `pnpm lint` pass.
- [ ] `HeroBand.test.tsx` and the new bar test pass under vitest.

**Behavior**
- [ ] With the dev server running, load `/` with DevTools set to the light
      color scheme and **JavaScript disabled**: the header and footer sit on
      a transparent plate with light ink over the dark hero. Re-enable JS,
      reload: identical first frame, and no plate fade after hydration.
- [ ] Scroll past the hero: the bars still release to the site theme exactly
      as before (the store owns them once `data-chrome-live` is set).
- [ ] Open the takeover menu: the header plate behaves as before.
- [ ] Load `/works` (no band at the top): bars are on the site theme from the
      first frame, unchanged.
- [ ] Emulate `prefers-reduced-motion: reduce`: no change (this plan adds no motion).

**Frame-by-frame**
- [ ] Run the sampler from plan 010's verification against the dev server in
      both color schemes. The `header transparent=` column must read `true`
      from the first frame the header exists and never flip; the
      `theme=` column may change from `null` to `dark` at hydration, but no
      frame between the two may show `transparent=false`.

**Feel**
- [ ] Reload the homepage five times in light mode with the Network panel on
      "Slow 4G". Nothing about the chrome should change at any point after
      first paint.

## Notes

- Only dark bands exist today (`HeroBand` defaults `theme="dark"` and no
  caller overrides it). If a light band ever opts in under a dark site theme,
  the light `:root` token block needs the mirrored second selector
  (`:root:has([data-hero-band-pin="light"]) :is(...):not([data-chrome-live])`);
  the plate rule already covers both values.
- The handover relies on React flushing the `useSyncExternalStore` client
  re-render in the same paint as the hydration commit's layout effects (that
  is where `HeroBand` writes the store). The sampler check above is the
  proof; if any frame shows `transparent=false` between the two states, the
  fix is to derive `data-chrome-live` from the store's own subscription
  instead of a separate hook.
