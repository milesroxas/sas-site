# 004 — Keep the mobile transcript panel inside the docked window until the handoff

- **Status**: TODO
- **Commit**: 25924b4
- **Severity**: HIGH (mobile only)
- **Category**: Physicality & origin
- **Estimated scope**: 3 files (`MenuAsk.tsx`, `Menu/index.tsx`, `docs/animations.md`), ~30-line diff
- **Depends on**: plan 002 (the wipe must rise from the window's bottom edge for the growth to be colour-continuous) and plan 003 (supplies `CHAT_STAGE_DELAY_MS`)

## Problem

The whole media→chat swap rests on one invariant, stated in the code at
`src/features/ask/MenuAsk.tsx:123`: the panel is "Always mounted and fully drawn
beneath the docked frame — the frame's wipe hands over to it invisibly (**same
color, same geometry**)". On desktop that invariant holds. Below `md` it is
broken from the first frame of the press.

The docked frame sits at `FRAME_Z` (45) with a `clip-path`, so it paints **only
its clipped window**; the menu overlay and the panel inside it are at `z-40`,
underneath. Anything of the panel that lies outside that window is therefore
visible immediately.

The slot changes box when the chat view opens:

```tsx
// src/features/ask/MenuAsk.tsx:113 — current
      <div
        data-menu-preview-slot
        className={cn(
          'pointer-events-none relative w-full md:col-start-2 md:row-start-1 md:aspect-auto md:h-full md:min-h-0',
          // Mobile chat view drops the 16:9 preview ratio and takes the free
          // column height (the menu hides nav + CTA underneath) so the
          // transcript reads as a full chat surface, not a letterboxed strip.
          chatView ? 'min-h-0 flex-1' : 'aspect-video',
        )}
      >
```

- **Desktop is unaffected**: `md:aspect-auto` cancels `aspect-video`,
  `md:h-full` fixes the height, and `flex-1` is inert on a grid child — the box
  is byte-identical in both states, which is precisely why the switch is
  invisible there.
- **Below `md`** the box goes from a 16:9 letterbox to the full free column
  height.

And the panel itself becomes opaque with no transition at all:

```tsx
// src/features/ask/MenuAsk.tsx:131 — current (do not change)
          className={cn(
            'bg-popover text-popover-foreground shadow-2xl pointer-events-auto absolute inset-0 flex flex-col overflow-hidden rounded-[20px] md:rounded-3xl [--card-spacing:--spacing(4)]',
            // No transition — the frame occludes this panel until the
            // handoff; opacity only guards against mis-stacking while idle.
            chatView ? 'opacity-100' : 'opacity-0',
          )}
```

So on a phone, **at the instant of the press**, before any wipe has run: the
panel's `bg-popover` surface snaps to full opacity across a box far taller than
the 16:9 window, and every part of it below the window is visible against the
menu's `bg-background`. The media window ends up framed by the very panel the
wipe is supposed to be introducing. There is then a **second** jump ~200ms later
when the nav and CTA finally release their layout space:

```ts
// src/Header/Menu/index.tsx:901 — current (do not change)
  const chatHideable = (extra?: string) =>
    cn(
      'max-md:transition-[opacity,display] max-md:transition-discrete max-md:duration-200 max-md:ease-out',
      chatView && 'max-md:hidden max-md:opacity-0 max-md:pointer-events-none',
      extra,
    )
```

## Target

The mobile slot keeps the docked window's 16:9 box as its base, so the panel is
exactly coincident with the window through the whole wipe and the handoff stays
invisible — as on desktop. The panel then **grows** into the freed column,
animated, starting on the same beat the nav finishes yielding it.

The growth is safe at that beat only because of plan 002: the cover rises from
the window's bottom edge, so that edge is `--color-popover` from the first
frame. The panel extending below it is therefore colour-continuous with the
cover — the surface reads as growing, not as a rectangle popping in.

```tsx
// target — src/features/ask/MenuAsk.tsx
      <div
        data-menu-preview-slot
        className={cn(
          'pointer-events-none relative aspect-video w-full md:col-start-2 md:row-start-1 md:aspect-auto md:h-full md:min-h-0',
          // Mobile chat view grows the 16:9 preview box into the column the nav
          // and CTA release, so the transcript reads as a full chat surface and
          // not a letterboxed strip. It must not grow before the wipe has
          // painted the docked window's lower edge: the frame paints only its
          // clipped box, so panel sticking out below shows against the menu
          // background. Collapse is instant — the panel's opacity snaps off in
          // the same commit, so there is nothing left to animate back.
          'max-md:min-h-0 max-md:transition-[flex-grow] max-md:ease-out',
          expanded ? 'max-md:grow max-md:duration-300' : 'max-md:duration-0',
        )}
      >
```

```tsx
// target — src/features/ask/MenuAsk.tsx, beside the existing chatView state
  /**
   * Mobile only: the transcript claims the column the nav and CTA release, but
   * the panel has to stay coincident with the docked window until the cover has
   * painted that window's lower edge — the cover rises from that edge, and the
   * nav finishes yielding its space, on this same beat.
   */
  const [expanded, setExpanded] = useState(false)
  useEffect(() => {
    if (!chatView) {
      setExpanded(false)
      return
    }
    const timer = window.setTimeout(() => setExpanded(true), CHAT_STAGE_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [chatView])
```

Resulting mobile sequence, one beat per step, nothing popping:

| t | What happens |
| --- | --- |
| 0 | Press. Slot keeps the 16:9 box, panel stays exactly under the window — nothing appears outside it. Cover starts rising from the window's bottom edge. Nav + CTA start fading. |
| 200ms | Nav/CTA release their layout space; the panel starts growing down into it, colour-continuous with the cover already painting that edge. Panel content starts staging (plan 003). |
| 340ms | Cover full, frame hides — same colour, same geometry, invisible switch. |
| 500ms | Growth and content staging both settle. |

`flex-grow` is a layout-triggering property, which the audit normally rejects.
It is a deliberate exception here: the box's participation in flex layout is
what has to change, no transform can express that, and the alternative on the
table is the un-animated jump this plan exists to remove. One container, three
children, 300ms.

## Repo conventions to follow

- Mobile-only motion is expressed with the `max-md:` variant on the shared
  element rather than a separate mobile branch — exemplar: `chatHideable` in
  `src/Header/Menu/index.tsx:901`, which is the sibling half of this very
  sequence.
- Timing shared between the GSAP side and the CSS side is imported from
  `src/Header/Menu/motion.ts` (established by plan 003), never restated.
- `MenuAsk` already owns every piece of chat-view state and reports upward
  through `onViewChange` (`src/features/ask/MenuAsk.tsx:89`); the new flag
  belongs there, not in `TakeoverMenu`.
- The Storybook decorator at `src/features/ask/MenuAsk.stories.tsx:23` forces
  `flex-1`/`aspect-auto` onto the slot with a `[&>…]` variant (specificity
  0,2,0), so it keeps overriding the new base `aspect-video` — the stories need
  no changes.

## Steps

1. **`src/features/ask/MenuAsk.tsx`** — import `CHAT_STAGE_DELAY_MS` from
   `@/Header/Menu/motion` (plan 003 already adds an import from that module; add
   to it).

2. **`src/features/ask/MenuAsk.tsx`** — add the `expanded` state and its effect
   from Target, directly after the existing `const [chatView, setChatView] =
   useState(false)` and its `showTranscript`/`hideTranscript` helpers (lines
   72–74). Do not change `showTranscript` or `hideTranscript` themselves —
   `expanded` derives from `chatView` alone, so every path that leaves the chat
   view (the X button, `resetConversation`, Escape/backdrop via
   `exitChatViewRef`, and the menu closing) collapses it without extra wiring.

3. **`src/features/ask/MenuAsk.tsx`** — replace the slot `<div>`'s `className`
   with the Target version. Note the three changes: `aspect-video` moves into
   the always-applied list, `chatView ? 'min-h-0 flex-1' : 'aspect-video'` is
   gone, and the two `max-md:` lines are added.

4. **`src/Header/Menu/index.tsx`** — add one comment line above `chatHideable`
   (line 901) recording that its `max-md:duration-200` is the same beat as
   `CHAT_STAGE_DELAY_MS`, so a future retune moves both:

   ```ts
   // Fade duration matches CHAT_STAGE_DELAY_MS (Menu/motion.ts): the space this
   // releases is the space the transcript panel starts growing into.
   ```

   Do not otherwise change the helper.

5. **`docs/animations.md`** — in the "Takeover menu (GSAP + CSS)" row (line 15),
   replace the substring `below \`md\` the chat view hands the nav's space to
   the transcript — nav + CTA fade then release layout
   (\`transition-discrete\`), the preview slot drops its 16:9 ratio and flexes
   to fill` with `below \`md\` the chat view hands the nav's space to the
   transcript — nav + CTA fade then release layout (\`transition-discrete\`),
   and only then does the preview slot grow out of its 16:9 box
   (\`flex-grow\` transition, gated on \`CHAT_STAGE_DELAY_MS\`): until that beat
   the panel stays exactly coincident with the docked window, because the frame
   paints only its clipped box and anything of the opaque panel outside it would
   show against the menu background`.

## Boundaries

- Do NOT change the panel `<section>`'s classes, including its untransitioned
  `opacity-100` / `opacity-0` — the instant opacity is what makes the collapse
  free, and it is correct once the geometry agrees.
- Do NOT change `chatHideable`'s classes, durations, or the
  `transition-discrete` mechanism — only add the comment in step 4.
- Do NOT change any desktop (`md:`) class on the slot.
- Do NOT rebuild the open timeline, re-dock the frame, or otherwise touch the
  frame's transform/clip on chat-view change. That was the other candidate fix
  and it is rejected: the frame's geometry is owned by the open timeline at
  `progress(1)`, and overriding it would corrupt the undock reverse.
- Do NOT make the mobile slot tall from the moment the menu opens. That would
  also remove the pop, but by changing the menu's *resting* preview composition
  from a 16:9 letterbox to a portrait window — a design change, not an
  animation fix.
- Do NOT add new dependencies.
- If the current code at the cited lines does not match the excerpts beyond the
  edits plans 002 and 003 make, STOP and report instead of improvising.

## Verification

- **Mechanical**:
  - `pnpm exec tsc --noEmit` → no output.
  - `pnpm exec vitest run src/Header/Menu src/features/ask` → passes.
    `index.test.tsx` stubs `MenuAsk` entirely, so it should be unaffected; if it
    fails, STOP and report.
- **Feel check — portrait phone (this is the finding)**: `pnpm dev`, DevTools
  device toolbar at 390×844 or a real device. Open the menu, type, press send.
  - At the instant of the press, **nothing** appears outside the 16:9 media
    window. Before this change, an opaque popover-coloured surface snapped in
    around it. Step through the first 200ms frame by frame in the Performance
    panel if you need certainty.
  - The panel then grows downward smoothly into the space the nav vacates. There
    must be no visible seam or colour step between the growing panel and the
    cover above it — they are both `--color-popover`. If you see a seam, plan
    002 is not applied (the cover is still wiping downward) — STOP and report.
  - The media→panel switch is still invisible: no size change at the moment the
    media disappears.
  - The pill composer glides down as the panel grows and settles at the bottom.
    Confirm it glides once, not twice, and does not overshoot the safe-area
    padding.
  - Press X: the panel collapses instantly and invisibly (its opacity is already
    off), the cover retracts downward, the media returns. No 300ms box glide
    should be visible on the way out.
  - Submit again immediately, and spam submit/X a few times: no stuck `expanded`
    state, no half-grown box. The timer is cleared on every `chatView` change.
- **Feel check — desktop**: confirm nothing changed at all. Same box, same
  invisible handoff. A visible difference on desktop means `aspect-video` is
  leaking past `md:aspect-auto`.
- **Reduced motion**: toggle `prefers-reduced-motion: reduce`. The growth is a
  size change rather than a position change, so it may stay; what must not
  happen is the wipe or the content stage animating. Note in your report whether
  the growth still animates, so it can be gated later if it reads as too much.
- **Done when**: typecheck and tests pass, and the portrait feel check shows no
  opaque surface outside the media window at any point before the handoff.
