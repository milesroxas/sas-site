# 001 — Run the AudienceTabs swap-in cascade at the swap time scale

- **Status**: DONE
- **Commit**: cf956a9
- **Severity**: MEDIUM
- **Category**: Easing & duration (perceived performance)
- **Estimated scope**: 1 file, ~5-line diff

## Problem

In the AudienceTabs block, clicking a tab swaps the left column's copy. The
incoming copy cascades in using the site's scroll-entrance values verbatim —
0.6s per element, 0.04s stagger — while only the *outgoing* copy is sped up
(`timeScale(1.6)`). A scroll entrance can afford 0.6s because the user is
passively scrolling; a click-driven swap is a direct response to user input,
where slow motion reads as a slow product.

Measured from click with a typical 6-node column (intro paragraph + 5 list
items): exit finishes at ~0.375s, the incoming cascade then takes 0.6s + 5 ×
0.04s = 0.8s, so the column is not fully settled until **~1.18s** after the
click. The media wipe finishes at 0.6s, leaving the text visibly lagging the
image by more than half a second.

```ts
// src/blocks/AudienceTabs/use-audience-tabs-motion.ts:290 — current
      // Incoming copy cascades in with the site's swap-entrance language —
      // the under-media drop, blur settle, and stagger — so the column reads
      // one line at a time instead of landing as a single block.
      textTlRef.current = gsap.timeline().fromTo(
        texts,
        { autoAlpha: 0, y: -TEXT_Y, filter: `blur(${TEXT_BLUR_PX}px)` },
        {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: TEXT_DURATION,
          ease: TEXT_EASE,
          stagger: TEXT_STAGGER,
        },
        0,
      )
```

For reference, the exit half of the same swap (same file, inside the function
returned at the bottom of the hook) already runs at the swap tempo:

```ts
// src/blocks/AudienceTabs/use-audience-tabs-motion.ts:344 — current (do not change)
    textTlRef.current = gsap
      .timeline({
        onComplete: () => {
          swappingTextRef.current = true
          onTextSwap(index)
        },
      })
      .timeScale(EXIT_TIME_SCALE)
      .to(texts, { autoAlpha: 0, duration: TEXT_DURATION, ease: TEXT_EASE }, 0)
```

`EXIT_TIME_SCALE` is already imported at the top of this file as:

```ts
// src/blocks/AudienceTabs/use-audience-tabs-motion.ts:8
  SCROLL_REVEAL_EXIT_TIME_SCALE as EXIT_TIME_SCALE,
```

and is defined as `1.6` in `src/shared/ui/scroll-reveal/scroll-reveal.tsx:121`.

## Target

Apply `.timeScale(EXIT_TIME_SCALE)` to the incoming text timeline so both
halves of the swap run at the same 1.6× swap tempo. All tuning values stay
imported from the shared reveal — nothing is restated. Effective incoming
motion becomes 0.375s per element with a 25ms stagger; full settle from click
drops from ~1.18s to ~0.88s, and the text now finishes just after the 0.6s
media wipe instead of trailing it badly.

```ts
// target
      // Incoming copy cascades in with the site's swap-entrance language —
      // the under-media drop, blur settle, and stagger — compressed to the
      // same swap tempo as the exit half: click-driven motion runs faster
      // than the scroll entrance it borrows its values from.
      textTlRef.current = gsap
        .timeline()
        .timeScale(EXIT_TIME_SCALE)
        .fromTo(
          texts,
          { autoAlpha: 0, y: -TEXT_Y, filter: `blur(${TEXT_BLUR_PX}px)` },
          {
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: TEXT_DURATION,
            ease: TEXT_EASE,
            stagger: TEXT_STAGGER,
          },
          0,
        )
```

## Repo conventions to follow

- Motion tuning is never restated at call sites; shared values are imported
  from `src/shared/ui/scroll-reveal` and only choreography-specific offsets
  live in the block's own `AUDIENCE_TABS_MOTION` const
  (`src/blocks/AudienceTabs/use-audience-tabs-motion.ts:44`). Speeding up via
  the existing `EXIT_TIME_SCALE` token follows this rule; introducing a new
  duration constant would violate it.
- Exemplar for the timeScale pattern: the exit half in the same file
  (excerpted above), and `src/shared/ui/scroll-reveal/use-reveal-swap.ts:113`.

## Steps

1. In `src/blocks/AudienceTabs/use-audience-tabs-motion.ts`, find the
   "Text entrance half" `useGSAP` block (the one keyed on
   `dependencies: [textIndex, prefersReducedMotion]`). Replace
   `gsap.timeline().fromTo(` with
   `gsap.timeline().timeScale(EXIT_TIME_SCALE).fromTo(` (formatted across
   lines as shown in Target). Update the comment above it to the Target's
   wording. Change nothing else in the tween — from/to values, duration,
   ease, and stagger all stay as the imported constants.

## Boundaries

- Do NOT change the exit half, the media-wipe timeline, or the entrance
  timeline in this file.
- Do NOT touch `src/shared/ui/scroll-reveal/scroll-reveal.tsx`,
  `use-reveal-swap.ts`, or any token value (`SCROLL_REVEAL_UNDER_MEDIA`,
  `SCROLL_REVEAL_EXIT_TIME_SCALE`).
- Do NOT add new constants to `AUDIENCE_TABS_MOTION`.
- Do NOT change `src/blocks/AudienceTabs/Component.tsx`.
- If the current code at the cited lines doesn't match the excerpts (drift
  since cf956a9), STOP and report instead of improvising.

## Verification

- **Mechanical**: `pnpm exec tsc --noEmit` → no output.
- **Feel check**: `pnpm dev`, open a page with the AudienceTabs block (or
  `pnpm storybook` → AudienceTabs story). Click between tabs and confirm:
  - The column still reads as a cascade (top line leads, items follow) — the
    stagger must remain perceptible, not collapse into a group pop.
  - The text feels like a response to the click, not a scene change: fully
    settled well under a second, landing just after the image wipe.
  - Rapid tab-spamming stays clean — each click kills the running timelines
    and restarts without flicker (existing behavior, must not regress).
  - In DevTools Animations panel at 10% playback: incoming items still drop
    and de-blur individually, 25ms apart.
  - Toggle `prefers-reduced-motion` (Rendering panel): swap is instant, no
    motion (existing behavior, must not regress).
- **Tuning note for the reviewer**: if 1.6× still feels languid in the feel
  check, the single knob is the timeScale on this one timeline — try `2.0`
  inline and report back; do NOT change the shared token or per-tween values.
- **Done when**: typecheck passes and the feel check confirms a faster,
  still-cascading swap with media landing first.
