# 006 — Decide card navigation by movement, not by elapsed time

- **Commit:** f7f4cf7
- **Status:** DONE
- **Severity:** HIGH
- **Category:** 1 (purpose & frequency) + 3 (physicality & origin)
- **Estimated scope:** 2 files, ~70 lines

## Problem

Every `Card` navigates from a raw `mouseup` listener whose only test is that the
press lasted **≤ 250 ms**. Distance is never measured. A flick across the related-posts
rail is a sub-250 ms gesture by definition, so dragging the rail opens a post —
the exact complaint. The same handler fires in the static grid: press a card,
drag to select its text, release quickly, and the page navigates.

Embla already solves this correctly and the card never asks. Its drag handler
sets `preventClick` once the pointer travels more than `dragThreshold` (10 px)
and swallows the resulting `click` at the carousel root in the **capture** phase
(`node_modules/.pnpm/embla-carousel@8.6.0/node_modules/embla-carousel/esm/embla-carousel.esm.js:365`
and `:388`). A `click`-based card would inherit that suppression for free.
A `mouseup`-based card sidesteps it entirely.

Second defect, same gesture: the card carries `pressable pressable-subtle`, so it
compresses to `scale(0.985)` on pointer-down and **stays compressed for the whole
drag**. Press feedback means "your click was received". During a drag it is a lie,
and it is the visual half of why a drag feels like a click.

## Where

| File | Lines | What's there |
| --- | --- | --- |
| `src/utilities/useClickableCard.ts` | 41–101 | `mousedown`/`mouseup` listeners; 250 ms test; no distance test |
| `src/components/Card/index.tsx` | 84 | `pressable pressable-subtle` on the split (rail) card |
| `src/app/(frontend)/globals.css` | 116–136 | The `pressable` utility that owns the press scale |

### Current code

```ts
// src/utilities/useClickableCard.ts:41
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.target) {
      const target = e.target as Element

      const timeNow = Date.now()
      const parent = target?.closest('a')

      pressedButton.current = e.button

      if (!parent) {
        hasActiveParent.current = false
        timeDown.current = timeNow
      } else {
        hasActiveParent.current = true
      }
    }
  }, [])

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (link.current?.href) {
        const timeNow = Date.now()
        const difference = timeNow - timeDown.current

        if (link.current?.href && difference <= 250) {
          if (!hasActiveParent.current && pressedButton.current === 0 && !e.ctrlKey) {
```

```ts
// src/utilities/useClickableCard.ts:86
    if (cardNode) {
      cardNode.addEventListener('mousedown', handleMouseDown, {
        signal: abortController.signal,
      })
      cardNode.addEventListener('mouseup', handleMouseUp, {
        signal: abortController.signal,
      })
    }
```

```css
/* src/app/(frontend)/globals.css:127 */
  &:active:not([aria-haspopup="true"]) {
    scale: var(--press-scale);
    transition-duration: var(--press-duration);
    transition-timing-function: var(--press-ease);
  }
```

## Target

Navigation is decided by **pointer travel**, on the `click` event.

```ts
/**
 * Travel, in px, that turns a press into a drag. This is embla's own
 * `dragThreshold` default, so the card and the carousel agree on what a drag
 * is: movement embla ignores still opens the post, movement embla acts on
 * never does — no band where neither responds.
 */
const DRAG_SLOP_PX = 10

/** Marks the card while a press has become a drag, so `pressable` lets go. */
const DRAGGING_ATTR = 'data-dragging'
```

Rules the handler enforces, in order:

1. **`pointerdown`** records `clientX/clientY` (primary pointer, `button === 0`
   only) and whether the target sits inside an `<a>`; it opens a per-press
   `AbortController` and attaches `pointermove` / `pointerup` / `pointercancel`
   on `document` with `{ passive: true }`.
2. **`pointermove`**: once `Math.hypot(dx, dy) > 10`, clear the recorded start
   point (this press can no longer navigate) and set `data-dragging` on the card.
3. **`pointerup` / `pointercancel`**: remove `data-dragging`, abort the per-press
   controller.
4. **`click`** (bubble phase, on the card): navigate only when a start point
   survives; then clear it. Bail on `event.defaultPrevented`, and on
   `metaKey`, `ctrlKey`, `shiftKey`, `altKey` — those belong to the inner anchor
   and the browser, not to a synthetic `router.push`. Keep the existing
   `hasActiveParent` bail so a click on the real `<Link>` is handled once.
5. Delete `timeDown`, `pressedButton` and the 250 ms comparison. A deliberate
   400 ms press that never moves is a click and must navigate.

Nothing else in the hook's shape changes: same `{ card, link }` return, same
`startTransition` + `addTransitionType(transitionType)` + `router.push(href, { scroll })`
body, same `external`/`newTab` `window.open` branch, same single `useEffect` with
one outer `AbortController`.

**Why `click` and not `pointerup`:** embla's suppression is a capture-phase
`stopPropagation()` on the carousel root, which is an ancestor of the card. A
bubble-phase `click` listener on the card is never reached once embla decides a
drag happened — the carousel case is fixed by the event choice alone, and the
10 px slop covers every card outside a carousel.

Press release, appended **after** the existing `&:active` rule inside `@utility pressable`:

```css
  /* A press that became a drag was never a click. Cards on the rail are
     dragged about as often as they are opened, and one that stays compressed
     for the length of a drag reads as an accepted click. It goes quiet on the
     press curve rather than the springy release curve — a cancelled press
     should not bounce back as if something completed. */
  &[data-dragging]:active:not([aria-haspopup="true"]) {
    scale: 1;
    transition-duration: var(--press-duration);
    transition-timing-function: var(--press-ease);
  }
```

**Why these values**

- **10 px** — embla's `dragThreshold` default, read at
  `embla-carousel.esm.js:1437`. Any other number opens a gap where the card and
  the carousel disagree.
- **No time limit** — time was standing in for intent and got it backwards:
  flicks are fast, careful clicks are slow.
- **`scale: 1`** — full release, not a smaller press. The gesture is no longer a
  press at all.
- **`--press-duration` (150 ms) + `--press-ease` (`cubic-bezier(0, 0, 0.2, 1)`)** —
  existing tokens, `globals.css:109–110`. The release token
  (`--press-release-ease: cubic-bezier(0.34, 1.56, 0.64, 1)`) overshoots, which
  is right for a completed click and wrong for a cancelled one.
- **`{ passive: true }`** — nothing here calls `preventDefault`; embla owns that.
  Passive listeners keep the drag off the main thread's critical path
  (`client-passive-event-listeners`).

## Conventions to follow

- Press tokens live in `src/app/(frontend)/globals.css:104–112`; the `pressable`
  utility that consumes them is at `:116`. Add to that utility, do not write a
  new one and do not restate a token's value.
- `src/features/cursor/press-tuning.ts` documents the press cadence contract —
  amplitude is per object, timing is shared. This change touches amplitude only.
- The existing `AbortController` + `signal` teardown in
  `useClickableCard.ts:83–99` is the house pattern for listeners; keep it and
  nest a second controller for the per-press listeners.
- The cursor ring's own press (`pressScale: 0.82` in
  `src/features/cursor/variants.ts:157`) is **correct** during a drag — the `drag`
  variant is `grabbable`, and the ring taking hold of the track is the point.
  Leave it alone.

## Steps

1. In `src/utilities/useClickableCard.ts`, add the `DRAG_SLOP_PX` and
   `DRAGGING_ATTR` constants with the comments above.
2. Replace `handleMouseDown` with `handlePointerDown` per rule 1; add a
   `pointerStart` ref (`{ x: number; y: number } | null`) and a
   `pressController` ref (`AbortController | null`). Delete `timeDown` and
   `pressedButton`.
3. Add `handlePointerMove` (rule 2) and `endPress` (rule 3).
4. Replace `handleMouseUp` with `handleClick` per rule 4, keeping the existing
   navigation body verbatim.
5. Rewire the `useEffect`: attach `pointerdown` (passive) and `click` to
   `cardNode` on the outer signal; abort the per-press controller in the
   cleanup so a mid-drag unmount leaves nothing on `document`.
6. Append the `&[data-dragging]:active:not([aria-haspopup="true"])` rule to
   `@utility pressable` in `src/app/(frontend)/globals.css`, after the existing
   `&:active` block.
7. Run `pnpm biome check --write` on the two files.

## Out of scope

- `src/components/ui/carousel.tsx` — the shadcn registry component. Its comments
  say divergence from the registry is deliberate‑only; this fix needs nothing
  from it.
- `src/sections/RelatedPosts/PostRail.client.tsx` layout and the carousel's
  `opts` — plan 007 owns those. Do not change `align`, `containScroll`, the
  slide bases or the gutters here.
- The `drag` cursor variant, its label, its ring scale, and
  `src/features/cursor/*` generally.
- Do not add a drag library, and do not set `user-select: none` — embla's
  non-passive `mousemove` `preventDefault` already suppresses selection inside
  the rail.

## Verification

**Build**

- [ ] `pnpm exec tsc --noEmit` and `pnpm biome check` pass.
- [ ] `pnpm vitest run src/blocks/Carousel` still passes (nearest existing suite).
- [ ] Storybook `Sections/RelatedPosts` renders both stories (`Default`, `Grid`).

**Behavior**

- [ ] Rail, mouse: press a card, drag 200 px, release. No navigation.
- [ ] Rail, mouse: press a card, jitter under 10 px, release after ~400 ms. It
      navigates. (This case is a regression today — the 250 ms cap kills it.)
- [ ] Rail, mouse: press a card, drag 200 px, release, then click a card without
      moving. It navigates — the drag state does not leak into the next press.
- [ ] Grid (`Grid` story, ≤ 3 posts): press a title and drag across it to select
      text, release fast. No navigation.
- [ ] Cmd-click (macOS) / Ctrl-click a card body: no same-tab `router.push`.
- [ ] Keyboard: Tab to a card title, press Enter. Navigates exactly once — no
      double push from the card handler.
- [ ] Touch/trackpad: swipe the rail on a real phone. No post opens.

**Feel**

- [ ] Record a drag and scrub it: the card must release its compression within
      the first ~10 px of travel, not at pointer-up. If the release reads as a
      second animation rather than a cancellation, the release curve is wrong —
      it should be the 150 ms ease-out, never the springy `back` release.
- [ ] Press and release without moving: the click-through press still reads
      exactly as it does today on every other `pressable` surface.

## Notes

The rail's cursor variant labels the whole surface `DRAG` and hides the native
cursor (`src/features/cursor/variants.ts:153–170`), while every card inside it is
a link. That mismatch is by design today and this plan does not touch it, but it
is the reason the drag/click ambiguity is felt so sharply here: the affordance
never tells you the card is also clickable. Whether the ring should acknowledge a
card under it is a design decision, not an audit finding.

## As built

Implemented as specified. One addition the plan did not call for:

- `src/utilities/useClickableCard.test.tsx` — 10 cases covering the whole
  contract (stationary press navigates; a 300 ms press still navigates; travel
  past 10 px does not; travel within 10 px does; `data-dragging` appears past the
  slop and clears on pointer-up; a drag does not poison the next press; modifier
  clicks are left to the browser; a press starting on the anchor does not
  double-push; a click with no press behind it is ignored; an
  already-`preventDefault`ed click is ignored). The hook had no coverage at all
  and this is a shared behaviour change across every `Card` on the site.

  The suite mocks `addTransitionType` from `react`: it exists in the React build
  Next bundles, not in the bare `react@19.2.7` vitest resolves.

Verified in Storybook (`Sections/RelatedPosts`) with Playwright: a 400 px mouse
drag across a card leaves the URL unchanged, `data-dragging` is absent at 4 px of
travel and present from 30 px, and it is gone after pointer-up.
