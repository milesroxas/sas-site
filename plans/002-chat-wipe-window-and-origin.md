# 002 — Size the chat wipe to the docked window and rise it from the composer

- **Status**: TODO
- **Commit**: 25924b4
- **Severity**: HIGH
- **Category**: Physicality & origin
- **Estimated scope**: 3 files (`motion.ts`, `Menu/index.tsx`, `docs/animations.md`), ~30-line diff

## Problem

Pressing send in the takeover menu's Ask composer runs the media→chat wipe: an
opaque popover-colored cover is appended to the hero layer *inside* the docked
page frame and its `clip-path` is tweened so it covers the window's media, after
which the frame hides in a same-color switch to the transcript panel beneath.

Two things are wrong with that cover.

### 1. The cover is sized to the frame, but the visible window is a crop of it

`mountHeroMedia` builds the hero layer at the full size of the fixed,
full-viewport page frame:

```ts
// src/Header/Menu/index.tsx:140 — current (do not change)
  gsap.set(layer, {
    position: 'absolute',
    top: scrollTop,
    left: 0,
    width: '100%',
    height: '100%',
```

and the cover fills that layer edge to edge:

```ts
// src/Header/Menu/index.tsx:871 — current
      gsap.set(cover, {
        position: 'absolute',
        inset: 0,
        // Above any hover-preview items stacked in the layer.
        zIndex: 10,
        pointerEvents: 'none',
        backgroundColor: 'var(--color-popover)',
        clipPath: 'inset(0% 0% 100% 0%)',
      })
```

But what the user actually sees is not the layer — it is the frame's
`clip-path`, a *centered crop of the preview slot's aspect ratio* computed by
`getViewportCrop` inside `getCardMotion`. The wipe is expressed in
**percentages of the cover**, so it only maps 1:1 to the visible window when the
crop happens to be full-height.

- **Desktop** (`md`+): the slot is taller than it is wide (`md:h-full` in a
  `minmax(18rem,28rem)` column), so the viewport is wider than the slot's
  aspect and `getViewportCrop` takes the "crop the sides" branch —
  `insetT === insetB === 0`, `clipH === vh`. Percentages map exactly. Desktop
  is fine today.
- **Portrait phone**: the slot is `aspect-video`, so the viewport is *taller*
  than the slot's aspect and the crop is a centered horizontal strip. On a
  390×844 viewport: `clipH = 390 / (16/9) ≈ 219`, `insetT = insetB ≈ 312`. The
  cover still travels the full 844px, but only 312→531 is visible. With
  `power3.out` over 340ms, the cover's leading edge crosses 312px at ≈48ms and
  531px at ≈96ms.

So on a phone the press produces a **~48ms flash** of the cover, then roughly
**244ms in which nothing on screen changes at all**, before the frame hides and
the panel's content begins to fade in. The wipe's whole job — explaining that
the media is being replaced by the transcript — happens too fast to read and
then leaves a dead hold.

### 2. The wipe travels away from the thing that was pressed

`inset(0% 0% 100% 0%)` is a zero-height band pinned to the **top** edge;
animating `bottom: 100% → 0%` grows it downward. The trigger — the submit
button in the pill composer — sits *below* the window. Meanwhile both content
entrances in the same choreography move upward:

```ts
// src/features/ask/MenuAsk.tsx:36 — current (do not change in this plan)
  open: 'translate-y-0 opacity-100 duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] [transition-delay:340ms]',
```

```ts
// src/features/ask/messages.tsx:14 — current (do not change in this plan)
export const transcriptItemEnter =
  'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]'
```

`translate-y-2 → 0` and `slide-in-from-bottom-2` both say "this content rises
from the composer". The wipe is the only piece contradicting it.

## Target

`getCardMotion` also returns the crop it already computes, so callers can
address the docked window's visible box. The cover is sized to that box instead
of to the frame, and the wipe rises from the window's bottom edge — from the
composer — and retracts back down on exit.

```ts
// target — src/Header/Menu/motion.ts, end of getCardMotion's return object
    clipPath: clipPathInset(crop.insetT, crop.insetR, crop.insetB, crop.insetL, borderRadius),
    openClipPath: clipPathInset(0, 0, 0, 0, 0),
    // The visible window in the element's own (unscaled) coordinates. Anything
    // overlaid inside the frame must be sized to this, not to the frame's full
    // viewport box, or percentage-based motion spends most of its travel in
    // masked-off area (a full-height cover inside a phone's 16:9 crop is
    // visible for barely a tenth of its wipe).
    crop,
  }
```

```ts
// target — src/Header/Menu/index.tsx, new consts beside the other CHAT_* ones
/** Cover parked at the window's bottom edge: the wipe rises from the composer
 *  that was just pressed, matching the panel content's own rise. */
const CHAT_COVER_HIDDEN = 'inset(100% 0% 0% 0%)'
const CHAT_COVER_FULL = 'inset(0% 0% 0% 0%)'
```

```ts
// target — src/Header/Menu/index.tsx, new module-scope helper
/**
 * Fit the chat cover to the docked window's visible box, in the frame's own
 * unscaled coordinates (the hero layer is already offset to that box, so these
 * are layer-local). Without a measured dock — detached render, unusable slot —
 * fall back to filling the layer.
 */
const setCoverBox = (cover: HTMLElement, motion: ReturnType<typeof getCardMotion> | null) => {
  if (!motion) {
    gsap.set(cover, { top: 0, left: 0, width: '100%', height: '100%' })
    return
  }
  const { insetT, insetL, clipW, clipH } = motion.crop
  gsap.set(cover, { top: insetT, left: insetL, width: clipW, height: clipH })
}
```

Effect on a 390×844 phone: the wipe becomes 340ms of continuous, fully visible
travel across the 219px window instead of a 48ms flash plus a 244ms hold — and
it travels from the composer toward the header, in the same direction as the
content that follows it.

## Repo conventions to follow

- **Dock geometry math lives in `motion.ts` exactly once.** Its header comment
  states the contract: "the dock geometry (open/close in `index.tsx`) and the
  hero handoff (`heroHandoff.ts`) both land a full-viewport element on a
  measured rect with the same uniform scale + centered clip mask, so the math
  and the shared tunables live here exactly once". Returning the crop from
  `getCardMotion` extends that; re-deriving the crop inside `index.tsx` would
  violate it.
- **Runtime-computed geometry is applied with `gsap.set`, never Tailwind
  classes.** Exemplar and the reason, verbatim in the code:
  `src/Header/Menu/index.tsx:136` — "Inline styles (not utility classes) —
  runtime-assigned classes are invisible to the Tailwind build."
- **Clip-path strings must stay structurally identical so GSAP can
  interpolate.** `src/Header/Menu/motion.test.ts:129` asserts exactly this for
  the dock's pair; `CHAT_COVER_HIDDEN` and `CHAT_COVER_FULL` are both
  four-value `inset()` with matching units, so they interpolate.
- Adding a key to `getCardMotion`'s return is safe: every consumer
  (`index.tsx:533`, `heroHandoff.ts:345`, `motion.test.ts:118`) reads named
  properties, none does a whole-object equality assertion.

## Steps

1. **`src/Header/Menu/motion.ts`** — in `getCardMotion` (line 112), add `crop`
   to the returned object with the comment shown in Target. Change nothing else
   in the function; `getViewportCrop` already produces the value.

2. **`src/Header/Menu/index.tsx`** — replace the two literal clip-path strings
   in the chat-swap block with the named consts from Target. Add them directly
   below `const CHAT_COVER_SELECTOR = '[data-menu-chat-cover]'` (line 105).

3. **`src/Header/Menu/index.tsx`** — add the `setCoverBox` helper from Target at
   module scope, immediately after `prefersReducedMotion` (line 193), so it
   sits with the other module-scope frame helpers.

4. **`src/Header/Menu/index.tsx`** — add a ref for the measured dock beside the
   existing timeline refs (after `rebuildTimelineRef`, line 312):

   ```ts
     /** Last measured dock geometry — the chat cover sizes itself to its crop. */
     const cardMotionRef = useRef<ReturnType<typeof getCardMotion> | null>(null)
   ```

5. **`src/Header/Menu/index.tsx`** — populate that ref inside `buildTimeline`:
   - In the no-usable-slot early return (the branch at line 527 that builds
     `overlayFadeTimeline`), add `cardMotionRef.current = null` before
     `const tl = overlayFadeTimeline(overlay)`.
   - Immediately after `const motion = getCardMotion(slotRect, borderRadius)`
     (line 533), add `cardMotionRef.current = motion`.

   Both branches, so the ref never holds geometry from a previous viewport.

6. **`src/Header/Menu/index.tsx`** — in `handleChatViewChange`, change the cover
   creation so it no longer uses `inset: 0`, and size it on every entry into the
   chat view (not only on creation), because the viewport may have changed
   between two chat views within one open:

   ```ts
       if (!cover) {
         cover = document.createElement('div')
         cover.setAttribute('data-menu-chat-cover', '')
         cover.setAttribute('aria-hidden', 'true')
         gsap.set(cover, {
           position: 'absolute',
           // Above any hover-preview items stacked in the layer.
           zIndex: 10,
           pointerEvents: 'none',
           backgroundColor: 'var(--color-popover)',
           clipPath: CHAT_COVER_HIDDEN,
         })
         layer.appendChild(cover)
       }
       setCoverBox(cover, cardMotionRef.current)
   ```

   Then the wipe target becomes `clipPath: CHAT_COVER_FULL` and the exit target
   (the `gsap.to(existing, …)` in the `if (!next)` branch, line 856) becomes
   `clipPath: CHAT_COVER_HIDDEN`. Leave both durations, both eases, the
   `overwrite: 'auto'`, and the `onComplete` frame-hide exactly as they are.

7. **`src/Header/Menu/index.tsx`** — keep the cover in sync on resize. Inside
   `onResize`, the debounced callback already re-pins the hero layer:

   ```ts
   // src/Header/Menu/index.tsx:704 — current
                 const heroLayer = frame.querySelector<HTMLElement>(HERO_LAYER_SELECTOR)
                 if (heroLayer) gsap.set(heroLayer, { top: frame.scrollTop })
   ```

   Add directly after it:

   ```ts
                 // The cover is absolutely sized now, so it must be re-fitted to
                 // the rebuilt dock's crop (buildTimeline above refreshed it).
                 const cover = heroLayer?.querySelector<HTMLElement>(CHAT_COVER_SELECTOR)
                 if (cover) setCoverBox(cover, cardMotionRef.current)
   ```

   This is required, not optional: `inset: 0` tracked the layer automatically,
   absolute px does not.

8. **`src/Header/Menu/index.tsx`** — update the two stale directional phrases in
   the chat-swap comment block (lines 93–104): "wipes down over the window's
   media" → "wipes up over the window's media, from the composer's edge", and
   "then the cover retracts upward, unmasking the media" → "then the cover
   retracts downward, unmasking the media". Also add, in the same block, one
   sentence noting the cover is sized to the dock's visible crop so its
   percentage wipe maps to the window at every breakpoint.

9. **`docs/animations.md`** — in the "Takeover menu (GSAP + CSS)" row (line 15),
   replace the substring `wipes down over the window's media (340ms GSAP
   clip-path, cropped by the dock's own mask — \`CHAT_WIPE_*\` consts)` with
   `wipes up over the window's media from the composer's edge (340ms GSAP
   clip-path, sized to the dock's visible crop so the percentage wipe maps to
   the window on every breakpoint — \`CHAT_WIPE_*\` consts)`, and the substring
   `retracts the cover in 200ms` with `retracts the cover downward in 200ms`.
   Change nothing else in that row.

## Boundaries

- Do NOT change `CHAT_WIPE_DURATION`, `CHAT_WIPE_EASE`, `CHAT_UNWIPE_DURATION`,
  or `CHAT_UNWIPE_EASE`. `power1.in` on the unwipe is a known separate finding
  and is deliberately out of scope here.
- Do NOT change `panelContent` in `src/features/ask/MenuAsk.tsx` or
  `transcriptItemEnter` in `src/features/ask/messages.tsx` — they are quoted
  above only as evidence of the intended direction.
- Do NOT change the preview slot's classes, the `chatHideable` helper, or
  anything about the mobile chat layout.
- Do NOT touch `mountHeroMedia`, `showHoverMedia`, `heroHandoff.ts`, the open
  timeline's tweens, or `getViewportCrop`.
- Do NOT add new dependencies.
- If the current code at the cited lines does not match the excerpts (drift
  since 25924b4), STOP and report instead of improvising.

## Verification

- **Mechanical**:
  - `pnpm exec tsc --noEmit` → no output.
  - `pnpm exec vitest run src/Header/Menu` → passes. `motion.test.ts` and
    `index.test.tsx` must both stay green without edits; if either needs
    changing, STOP and report.
- **Feel check — desktop**: `pnpm dev`, open the takeover menu on a page with
  hero media, type a question, press the arrow.
  - The cover rises from the bottom of the window to the top across the whole
    340ms — no flash, no dead hold.
  - The switch to the transcript panel is still invisible: no color step, no
    corner pop at the 20/24px radius.
  - Press the X to exit: the cover retracts downward and the media reappears
    from the top down.
  - Resize the window while the transcript is open, then exit and re-enter chat
    view: the cover still fills exactly the window, with no sliver of media
    showing at an edge.
- **Feel check — portrait phone (required, this is the finding)**: DevTools
  device toolbar at 390×844, or a real device.
  - The wipe is now a full, readable 340ms rise across the letterboxed window.
    Before this change it was a sub-100ms flash followed by a visible hold —
    confirm that hold is gone.
  - In the DevTools Animations panel at 10% playback, the cover's leading edge
    should be inside the visible window for the entire tween, never above or
    below it.
- **Reduced motion**: toggle `prefers-reduced-motion: reduce` in the Rendering
  panel. The swap should still be instant (duration 0) with no flicker — the
  cover snaps to full and the panel appears.
- **Done when**: typecheck and the Menu tests pass, and the portrait feel check
  shows one continuous bottom-to-top wipe filling the visible window.
