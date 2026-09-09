# 008: Let the Ask transcript's content arrive after the handoff

- **Status**: DONE (executed and frame-verified 2026-09-09; real-device feel-check pending)
- **Commit**: de5bb14
- **Severity**: HIGH (the one press every Ask conversation starts with)
- **Category**: 7. Cohesion, hierarchy & spatial consistency (with 2. Easing & duration)
- **Estimated scope**: 4 files, ~40 lines (2 constants, 1 class map, 3 comment blocks, 1 doc sentence)

## Problem

Submitting the Ask pill in the takeover menu runs a two-part swap: an opaque
popover-colored cover wipes up over the docked window's media (340ms,
`power3.out`, GSAP, `src/Header/Menu/index.tsx`), then the frame hides in a
same-color switch to the transcript panel that is always mounted beneath it.
The panel's content (the `CardHeader` and the `MessageScroller`) starts its
own rise at 200ms, *under* that occlusion, on a very steep ease-out
(`cubic-bezier(0.22, 1, 0.36, 1)`, 300ms). At the 340ms handoff the content
is 140/300 = 46.7% through its timeline, which on that curve is **95% of the
way there**: opacity 0.95 and about 0.4px of the 8px rise left.

So what the user actually sees is: a blank surface wipes up over the media,
and then in a single frame the title, the description, the X, the message
they just sent and the "Thinking…" shimmer are all simply *there*. The
motion the code pays for happens behind an opaque layer; the visible result
is a snap. The comment in `motion.ts` calls this "free motion" and a faster
settle (500ms instead of 640ms). It is a real trade-off, but it trades away
the only thing the press had to show: content arriving.

Rule broken: an entrance the user cannot see is not an entrance. The course
bar wants one entrance per container with the content already in place, but
that only works when the reveal *carries* the content (a mask uncovering the
drawn panel). Here the reveal is an opaque cover above the panel, so it can
only ever uncover a blank surface. The content therefore needs its own,
visible arrival, and it must start on the handoff frame, not before it.

## Where

| File | Lines | What's there |
| --- | --- | --- |
| `src/Header/Menu/motion.ts` | 36–46 | `CHAT_STAGE_DELAY_MS = 200`, `CHAT_STAGE_DURATION_MS = 300` and the "free motion" rationale |
| `src/features/ask/MenuAsk.tsx` | 32–46 | Component doc comment restating that rationale |
| `src/features/ask/MenuAsk.tsx` | 48–66 | `panelContent` class map and `panelContentStyle` (delay / duration from the module) |
| `src/features/ask/MenuAsk.tsx` | 148–164 | `expanded` timer, fires on `CHAT_STAGE_DELAY_MS` (window growth, both breakpoints) |
| `src/features/ask/MenuAsk.tsx` | 262–271 | `CardHeader` wired to `panelContent` |
| `src/features/ask/MenuAsk.tsx` | 298–305 | `MessageScroller` wired to `panelContent` |
| `src/Header/Menu/index.tsx` | 1402–1408 | `chatHideable` comment claiming its 200ms "matches CHAT_STAGE_DELAY_MS" |
| `docs/animations.md` | 17 | Takeover-menu row, the "content starts staging under the occlusion (200ms delay …)" clause |

### Current code

```ts
// src/Header/Menu/motion.ts:36
/**
 * Panel content staging. The panel is occluded for the whole wipe, so its
 * content starts before the handoff for free: at 200ms + 300ms on a strong
 * ease-out it is ~95% drawn when the switch happens (the switch stays
 * invisible) and settles at 500ms rather than 640ms.
 */
export const CHAT_STAGE_DELAY_MS = 200
export const CHAT_STAGE_DURATION_MS = 300
```

```tsx
// src/features/ask/MenuAsk.tsx:48
const panelContent = {
  open: 'translate-y-0 opacity-100 ease-[cubic-bezier(0.22,1,0.36,1)]',
  closed: 'translate-y-2 opacity-0 duration-150 ease-in',
}

/**
 * Open-state timing comes from the menu's chat-swap module, never from a
 * Tailwind arbitrary value: the delay has to agree with a GSAP wipe that lives
 * there, and a restated number desyncs silently the moment the wipe is
 * retuned. Inline style because Tailwind cannot see a runtime constant.
 */
const panelContentStyle = (chatView: boolean): React.CSSProperties =>
  chatView
    ? {
        transitionDuration: `${CHAT_STAGE_DURATION_MS}ms`,
        transitionDelay: `${CHAT_STAGE_DELAY_MS}ms`,
      }
    : {}
```

```tsx
// src/features/ask/MenuAsk.tsx:262  (header)
<CardHeader
  className={cn(
    'border-b pt-(--card-spacing) motion-safe:transition-[opacity,translate]',
    chatView ? panelContent.open : panelContent.closed,
  )}
  style={panelContentStyle(chatView)}
>
```

```tsx
// src/features/ask/MenuAsk.tsx:298  (transcript)
<MessageScroller
  className={cn(
    'min-h-0 flex-1 motion-safe:transition-[opacity,translate]',
    chatView ? panelContent.open : panelContent.closed,
  )}
  style={panelContentStyle(chatView)}
>
```

```tsx
// src/Header/Menu/index.tsx:1402
// Fade duration matches CHAT_STAGE_DELAY_MS (Menu/motion.ts): the space this
// releases is the space the transcript panel starts growing into.
const chatHideable = (extra?: string) =>
  cn(
    'max-md:transition-[opacity,display] max-md:transition-discrete max-md:duration-200 max-md:ease-out max-md:starting:opacity-0',
```

## Target

Two beats, both visible, read as one upward motion from the composer:

1. **Cover wipe** (unchanged): 340ms `power3.out`, rising from the composer's
   edge to the top of the window. Ends on the handoff frame, where the window
   is a blank popover surface (cover and panel are the same color, so the
   switch itself stays invisible).
2. **Content arrival** (new timing): starts *on* the handoff frame and runs
   300ms on `cubic-bezier(0.22, 1, 0.36, 1)`. The transcript rises 8px from
   the composer's direction while fading in; the header, at the top where the
   wipe just landed, fades in place with no translate. The desktop window
   growth (16:9 to full slot) and the phone slot growth start on the same
   frame, so the surface expands as its content settles: one beat, not two.

Whole press settles at 640ms.

```ts
// src/Header/Menu/motion.ts
/**
 * Panel content staging. The cover is opaque and sits above the panel, so
 * nothing that happens under it is seen: the content's rise has to start on
 * the handoff frame or the user gets a blank wipe followed by a snap. It
 * starts exactly when the wipe ends and reads as the wipe continuing into
 * the panel: the transcript rises from the composer's edge while the
 * header, where the wipe just landed, fades in place. The window grows on
 * the same beat (CHAT_WINDOW_RESIZE_MS), so surface and content arrive
 * together and the press settles at 640ms.
 */
export const CHAT_STAGE_DELAY_MS = CHAT_WIPE_DURATION * 1000
export const CHAT_STAGE_DURATION_MS = 300
```

```tsx
// src/features/ask/MenuAsk.tsx
/**
 * Content arrival. The transcript rises from the composer's direction; the
 * header fades in place (it sits where the wipe just landed, and chrome is
 * the least important thing on the surface, so it gets the least motion).
 * Both share one start (the handoff frame) and one curve so they read as a
 * single beat. Exits keep the shorter 150ms ease-in the rest of the swap's
 * exit uses.
 */
const panelContent = {
  open: 'translate-y-0 opacity-100 ease-[cubic-bezier(0.22,1,0.36,1)]',
  closed: 'translate-y-2 opacity-0 duration-150 ease-in',
}
const panelChrome = {
  open: 'opacity-100 ease-[cubic-bezier(0.22,1,0.36,1)]',
  closed: 'opacity-0 duration-150 ease-in',
}
```

```tsx
// header: fade only
<CardHeader
  className={cn(
    'border-b pt-(--card-spacing) motion-safe:transition-opacity',
    chatView ? panelChrome.open : panelChrome.closed,
  )}
  style={panelContentStyle(chatView)}
>

// transcript: unchanged wiring, rises 8px + fades
<MessageScroller
  className={cn(
    'min-h-0 flex-1 motion-safe:transition-[opacity,translate]',
    chatView ? panelContent.open : panelContent.closed,
  )}
  style={panelContentStyle(chatView)}
>
```

```tsx
// src/Header/Menu/index.tsx (comment only; the 200ms stays)
// Fades out in 200ms, well inside the wipe (CHAT_WIPE_DURATION), so the
// column is already released when the slot grows into it on the handoff
// beat (CHAT_STAGE_DELAY_MS, Menu/motion.ts).
```

**Why these values**

- **Delay = `CHAT_WIPE_DURATION * 1000` (340ms)**: the first frame the content
  can be seen. Any head start is wasted and, on this curve, wasteful in a
  specific way: a 40ms head start already puts the content at 51%, a 100ms
  head start at 67% (see the bezier table below). Derive it from the wipe
  constant rather than restating 340, so retuning the wipe cannot desync it.
- **300ms, `cubic-bezier(0.22, 1, 0.36, 1)`**: unchanged. It is the transcript
  items' own entrance curve (`transcriptItemEnter`, `messages.tsx`) and the
  slot growth's duration, so the surface, its content and later messages all
  share one tempo. Steep enough that 300ms reads as fast (65% done at 60ms).
- **Header fades, transcript rises**: vary the entrance by importance. The
  transcript is what the user is waiting on and rises from where the press
  came from; the header is chrome and just needs to be there. Two rises with
  identical delay, distance and curve would be a uniform stagger without the
  stagger, and would also have the header rising *into* the edge the wipe
  just finished on.
- **Growth on the same beat**: keeps a single constant driving both. Side
  benefit on desktop: today the window starts growing from its center at
  200ms, when the cover is only 93% up, so a popover strip appears above the
  window's top edge while a sliver of media is still uncovered beneath it.
  Starting at 340 removes that.
- **640ms total**: past the 200–500ms modal budget as a sum, but it is two
  beats of 340 and 300, each on a steep ease-out. The budget applies per
  beat; Vaul's 500ms enter on a steep curve does not read as slow.

Bezier reference for `cubic-bezier(0.22, 1, 0.36, 1)` (progress in / out):
0.05 → 0.215, 0.10 → 0.401, 0.133 → 0.506, 0.20 → 0.674, 0.30 → 0.832,
0.467 → 0.950, 0.60 → 0.984.

## Repo conventions to follow

- Chat-swap timing lives once, in `src/Header/Menu/motion.ts`, and reaches
  `MenuAsk` through `panelContentStyle` as inline `transitionDelay` /
  `transitionDuration`. Never restate the number as a Tailwind
  `delay-[340ms]` class. `PreviewSlot.tsx` does the same with
  `CHAT_WINDOW_RESIZE_MS`.
- Exit timing on `panelContent.closed` (`duration-150 ease-in`) is part of
  the "entry in reverse" exit contract with `CHAT_PANEL_EXIT_MS` /
  `CHAT_WINDOW_RESIZE_MS`. Leave it.
- Entrance curve: `cubic-bezier(0.22,1,0.36,1)` as an arbitrary Tailwind
  ease, exactly as `transcriptItemEnter` in `src/features/ask/messages.tsx`
  writes it.
- Motion gating: `motion-safe:` on every transition utility, as the two
  call sites already do. Reduced motion stays instant (house style).
- No em dashes in comments or docs. Use a colon, comma or period.
- Exemplar for "chrome fades, content moves": the takeover menu's open
  cascade in `src/Header/Menu/index.tsx` (`buildTimeline`): offstage items
  fade with `y: 0`, on-stage items rise.

## Steps

1. `src/Header/Menu/motion.ts`: replace the block at lines 36–46 with the
   target block above. `CHAT_WIPE_DURATION` is declared above it (line 29),
   so the derived value is in scope. Keep `CHAT_WINDOW_RESIZE_MS =
   CHAT_STAGE_DURATION_MS` (line 56) as is; its comment already says the
   growth runs "on the staging beat".
2. `src/features/ask/MenuAsk.tsx`: add `panelChrome` next to `panelContent`
   (target above) and replace the `panelContent` doc comment with the target
   one. Do not touch `panelContentStyle`.
3. `src/features/ask/MenuAsk.tsx`: switch the `CardHeader` to
   `motion-safe:transition-opacity` + `panelChrome`. Leave the
   `MessageScroller` wiring unchanged.
4. `src/features/ask/MenuAsk.tsx`: rewrite the paragraph of the component
   doc comment (lines 36–40, "The panel never animates its entry; only its
   content stages in, and it starts before the handoff under that occlusion
   (free motion: …)") to: "The panel never animates its entry; its content
   arrives on the handoff frame, the first frame it can be seen, and rises
   from the composer's edge as the wipe's continuation (CHAT_STAGE_*)." Also
   update the `CardHeader` comment at line 254 ("Header stages in alongside
   the transcript, landing at the wipe's end") to say the header fades in
   place on the handoff beat while the transcript rises.
5. `src/Header/Menu/index.tsx`: replace the two comment lines at 1402–1403
   with the target comment. The `max-md:duration-200` class stays.
6. `docs/animations.md` line 17: in the Takeover-menu row, replace the clause
   that starts "whose content starts staging under the occlusion (200ms
   delay, 300ms" and ends "applied by `panelContent` in `MenuAsk`)" with
   "whose content arrives on the handoff frame (delay equal to the wipe, 300ms on the transcript entrance curve; the transcript rises from the composer's edge, the header fades in place, and the window grows on the same beat, so the press settles at 640ms; `CHAT_STAGE_*` in `Menu/motion.ts`, applied by `panelContent` / `panelChrome` in `MenuAsk`)".
   Further along the same row, "the chat view grows the transcript out of the preview's 16:9 box on the `CHAT_STAGE_DELAY_MS` beat" stays true.
7. Run `pnpm tsc --noEmit` and the project lint.

## Boundaries

- Do not change `CHAT_WIPE_DURATION`, `CHAT_WIPE_EASE`, the cover geometry
  (`setCoverBox`, `CHAT_COVER_*`), or anything in `handleChatViewChange`.
- Do not change exit timing: `CHAT_UNWIPE_*`, `CHAT_PANEL_EXIT_MS`,
  `CHAT_EXIT_RELEASE_MS`, `panelContent.closed`, `PreviewSlot`'s shrink.
- Do not touch `transcriptItemEnter`, `AskWidget.tsx`, `SubmitButton.tsx`,
  `message-scroller.tsx`, or the menu's open cascade constants.
- Do not add an entrance to the panel `<section>` itself; it must stay fully
  drawn under the frame (`opacity-100 duration-0`).
- Do not restate 340 anywhere; derive from `CHAT_WIPE_DURATION`.
- No new dependencies.
- If the feel-check below says the two beats read as a double arrival, do
  **not** re-overlap the content under the cover. The lever is the wipe:
  drop `CHAT_WIPE_DURATION` to `0.28` (still `power3.out`), which pulls the
  delay with it. Try 0.34 first; only move to 0.28 with a recorded
  side-by-side.

## Verification

**Build**
- [ ] `pnpm tsc --noEmit` passes; lint passes.
- [ ] `src/Header/Menu/index.test.tsx` still passes (it stubs `MenuAsk`, so
      nothing there depends on the timing; it must simply not break).
- [ ] Storybook `Features/TakeoverMenu` › `Default` and `Mobile` render.
      Note: `Features/MenuAsk` has no page frame and no cover, so its panel
      pops in at 0ms by design; it is not the surface to judge this on.

**Behavior** (Storybook `Features/TakeoverMenu` › `Default`, desktop width)
- [ ] Open the menu, type in the pill, submit. The cover wipes up over the
      media; on the frame it lands, the window is a blank popover surface.
- [ ] From the next frame: the transcript (your message + "Thinking…") rises
      about 8px and fades in over 300ms; the title, description and X fade
      in place with no vertical movement; the window grows to the full slot
      over the same 300ms.
- [ ] Nothing pops after the handoff: no element goes from absent to fully
      opaque between two consecutive frames.
- [ ] Press X while the content is still rising. It retargets from where it
      is (CSS transition, no restart) and exits on the existing 150ms.
- [ ] Submit, press X, submit again quickly: no stuck half-opacity content,
      no double-fired growth.
- [ ] `Mobile` story (390px): nav and CTA fade in 200ms, the column sits
      empty for ~140ms while the cover finishes, then the slot grows down
      into it as the content arrives, and the composer rides down with it
      (the slot is a flex child above the composer; this growth predates
      the plan and is unchanged, only its start beat moved).
- [ ] DevTools "Emulate prefers-reduced-motion: reduce": cover, growth and
      content all switch instantly; nothing moves.

**Feel**
- [ ] Record the desktop press at 25% speed (or DevTools Animations panel)
      and scrub. The wipe should hand straight into the content's rise with
      no dead frame and no snap; if the join looks like two separate
      arrivals, see the last Boundaries bullet before touching anything.
- [ ] Watch only the header: it must feel like it was uncovered, not like it
      slid. If it draws attention, the curve is doing its job and the fade
      is right; if it looks late, it is not, and the delay is still correct
      (the content cannot be seen earlier).
- [ ] On a real phone, submit with the keyboard up. The 140ms empty-column
      hold should read as the wipe finishing, not as a stall.
- [ ] Look again with fresh eyes before calling it done.

## Notes

- Feel cannot be settled from code. The one open question is whether wipe
  then rise reads as one gesture (the intent) or as two arrivals. The
  Boundaries section gives the only knob to pull if it is the latter.
- The truly single-entrance version of this swap is a mask reveal of the
  already-drawn panel: the frame's own clip-path receding upward from the
  composer's edge, uncovering the content beneath, with no cover and no
  content stage at all (the site's brand grammar, "mask reveals by default",
  and the course's "one entrance per container"). It is not planned here
  because the frame's clip-path is owned by the dock timeline: a mid-close
  exit would put two tweens on the same property, and hover previews and
  the hero handoff both read that clip. If the team wants that version, it
  is a separate plan against `buildTimeline` and `handleChatViewChange`,
  not an extension of this one.
- Adjacent, not in scope: `MessageScrollerButton` (`src/components/ui/
  message-scroller.tsx`) exits on a 400ms ease-in, twice its 200ms enter.
  Exits should be the shorter half. File separately if wanted.
