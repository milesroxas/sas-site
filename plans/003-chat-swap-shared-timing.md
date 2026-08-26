# 003 — Give the chat swap one timing source and overlap its content stage

- **Status**: TODO
- **Commit**: 25924b4
- **Severity**: MEDIUM
- **Category**: Easing & duration + Cohesion & tokens
- **Estimated scope**: 4 files (`motion.ts`, `Menu/index.tsx`, `MenuAsk.tsx`, `docs/animations.md`), ~45-line diff
- **Depends on**: plan 002 (it renames comment text and adds two consts in the same block this plan moves)

## Problem

### 1. Pressing send takes 640ms to settle, strictly sequentially

The cover wipes for 340ms; only then does the panel's content begin a 300ms
fade-and-rise. Nothing overlaps, so a direct press response is not finished
until 640ms — above the 200–500ms budget for a panel of this kind.

```ts
// src/Header/Menu/index.tsx:99 — current
const CHAT_WIPE_DURATION = 0.34
```

```ts
// src/features/ask/MenuAsk.tsx:35 — current
const panelContent = {
  open: 'translate-y-0 opacity-100 duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] [transition-delay:340ms]',
  closed: 'translate-y-2 opacity-0 duration-150 ease-in [transition-delay:0ms]',
}
```

The 340ms delay exists because the panel is occluded by the docked frame until
the handoff — the file says so at `MenuAsk.tsx:27`: "The panel never animates
itself; only its content stages in, delayed to land exactly at that 340ms
handoff." That reasoning is right about *why* there is a delay and wrong about
its size: because the panel is invisible for the whole wipe, motion that happens
before the handoff **costs nothing**. The delay only needs to be large enough
that the content is visually settled when the switch happens, not equal to the
entire wipe.

### 2. `340` is written twice, in two files, in two units

`CHAT_WIPE_DURATION = 0.34` in `src/Header/Menu/index.tsx:99` and
`[transition-delay:340ms]` in `src/features/ask/MenuAsk.tsx:36`. Retuning the
wipe silently desyncs the content staging, and nothing in either file fails.
This is exactly what `docs/animations.md` forbids under Rules: "Every tunable
number exists in exactly one place; consumers import, never restate."

## Target

All chat-swap timing moves into `src/Header/Menu/motion.ts` — the takeover
menu's existing single source for shared motion primitives — and both consumers
import from there. The content stage delay drops to **200ms**.

Why 200ms specifically: the stage runs on
`cubic-bezier(0.22, 1, 0.36, 1)` for 300ms, so at the 340ms handoff it is
`(340 − 200) / 300 = 47%` through in time, which on that strongly front-loaded
curve is **≈95% of the way through in progress**. The panel is therefore still
visually "already drawn" at the switch — the invisible-handoff design is
preserved — while the whole press response settles at **500ms instead of 640ms**.

```ts
// target — src/Header/Menu/motion.ts, appended after the DISSOLVE_* consts
/**
 * Ask transcript swap. An opaque cover wipes over the docked window's media
 * (TakeoverMenu's chat-view handler), then the frame hides in a same-color
 * switch to the panel waiting fully drawn beneath (MenuAsk). Both halves live
 * in different files, so the one number they must agree on lives here.
 */
export const CHAT_WIPE_DURATION = 0.34
export const CHAT_WIPE_EASE = 'power3.out'
/** The handoff instant, in ms — for the CSS-side staging that must land on it. */
export const CHAT_HANDOFF_MS = CHAT_WIPE_DURATION * 1000
/** Exit: the frame returns instantly (still fully covered — same color, no
 *  visible change), then the cover retracts, unmasking the media. */
export const CHAT_UNWIPE_DURATION = 0.2
export const CHAT_UNWIPE_EASE = 'power1.in'
/**
 * Panel content staging. The panel is occluded for the whole wipe, so its
 * content starts before the handoff for free: at 200ms + 300ms on a strong
 * ease-out it is ~95% drawn when the switch happens (the switch stays
 * invisible) and settles at 500ms rather than 640ms.
 */
export const CHAT_STAGE_DELAY_MS = 200
export const CHAT_STAGE_DURATION_MS = 300
```

```ts
// target — src/features/ask/MenuAsk.tsx
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

## Repo conventions to follow

- `src/Header/Menu/motion.ts` is declared as the takeover-menu system's shared
  primitive module in its own header comment: "the math and the shared tunables
  live here exactly once (docs/animations.md contract)". Chat-swap timing shared
  across two files belongs there. `index.tsx`'s top-of-file consts are for
  values only that file uses.
- `MenuAsk` importing from `@/Header/Menu/motion` is not a cycle: `motion.ts`
  imports nothing from `index.tsx`. Cross-slice `@/` imports are already normal
  here — `src/Header/Menu/index.tsx:15` imports `@/features/ask/MenuAsk`, and
  `:14` imports `@/Footer/Clock`.
- Exemplar for "runtime constant applied as an inline value, with a comment
  saying why not a class": `src/Header/Menu/index.tsx:136` — "Inline styles
  (not utility classes) — runtime-assigned classes are invisible to the
  Tailwind build."
- Note that in this project `delay-*` is **animation**-delay, not
  transition-delay: `tw-animate-css` (imported at `globals.css:2`) overrides
  Tailwind's utility. That is why the current code writes
  `[transition-delay:340ms]` as an arbitrary property. Do not "simplify" any
  transition delay to `delay-*`.

## Steps

1. **`src/Header/Menu/motion.ts`** — append the chat-swap block from Target
   after the `DISSOLVE_DURATION` / `DISSOLVE_EASE` exports (line 14), before the
   "Docked-window card chrome" section.

2. **`src/Header/Menu/index.tsx`** — delete the local `CHAT_WIPE_DURATION`,
   `CHAT_WIPE_EASE`, `CHAT_UNWIPE_DURATION`, and `CHAT_UNWIPE_EASE` consts and
   add them to the existing `from './motion'` import list (which is alphabetised
   — insert them in order). Keep `CHAT_COVER_SELECTOR` local (it is a DOM
   selector, alongside `PAGE_FRAME_SELECTOR` and friends). If plan 002 has
   already added `CHAT_COVER_HIDDEN` / `CHAT_COVER_FULL`, move those to
   `motion.ts` in the same block and import them too — they are chat-swap
   tuning, not selectors.

   The explanatory comment currently sitting above these consts (lines 93–104)
   moves with them into `motion.ts`, merged with the Target's doc comments.
   **Move whatever wording is there now** — plan 002 reworded it; do not restore
   an earlier version.

3. **`src/features/ask/MenuAsk.tsx`** — import
   `{ CHAT_STAGE_DELAY_MS, CHAT_STAGE_DURATION_MS } from '@/Header/Menu/motion'`
   and replace the `panelContent` const with the `panelContent` +
   `panelContentStyle` pair from Target. Keep the existing block comment above
   it (lines 27–34) and update only its last sentence — "delayed to land exactly
   at that 340ms handoff" — to say the content starts before the handoff, under
   occlusion, so it is already drawn when the switch happens and settles sooner.

4. **`src/features/ask/MenuAsk.tsx`** — add `style={panelContentStyle(chatView)}`
   to the two elements that consume `panelContent`:
   - the `CardHeader` at line 141
   - the `MessageScroller` at line 170

   Leave their `className` expressions otherwise untouched. Both components
   spread their remaining props onto the underlying element, so `style` reaches
   the DOM.

5. **`docs/animations.md`** — in the "Takeover menu (GSAP + CSS)" row (line 15),
   replace the substring `whose content stages in on a matching 340ms
   transition delay (\`panelContent\` in \`MenuAsk\`)` with `whose content
   starts staging under the occlusion (200ms delay, 300ms — so it is ~95% drawn
   at the 340ms handoff and the whole press settles at 500ms;
   \`CHAT_STAGE_*\` in \`Menu/motion.ts\`, applied by \`panelContent\` in
   \`MenuAsk\`)`. In the same row's source-of-truth column, replace `the chat
   swap mask (\`CHAT_WIPE_*\` in \`index.tsx\`, content staging
   \`panelContent\` in \`src/features/ask/MenuAsk.tsx\`)` with `the chat swap
   timing (\`CHAT_WIPE_*\` / \`CHAT_STAGE_*\` in \`src/Header/Menu/motion.ts\`,
   consumed by both sides)`.

## Boundaries

- Do NOT change the closed-state timing (`duration-150 ease-in`). The `ease-in`
  there is a known separate finding, and that exit runs fully occluded.
- Do NOT change `CHAT_WIPE_DURATION` (0.34), either ease, or
  `CHAT_UNWIPE_DURATION` — this plan **moves** them, it does not retune them.
  The only value that changes is the content stage delay (340ms → 200ms).
- Do NOT change `transcriptItemEnter` in `src/features/ask/messages.tsx`.
- Do NOT change the preview slot's classes or the mobile chat layout.
- Do NOT touch `src/features/ask/AskWidget.tsx` — it must keep working with an
  unchanged `TranscriptItems` signature.
- Do NOT add new dependencies.
- If the current code at the cited lines does not match the excerpts beyond the
  edits plan 002 makes, STOP and report instead of improvising.

## Verification

- **Mechanical**:
  - `pnpm exec tsc --noEmit` → no output.
  - `pnpm exec vitest run src/Header/Menu src/features/ask` → passes.
  - `rg -n "340|0\.34" src/features/ask src/Header/Menu` → the only hit is the
    single `CHAT_WIPE_DURATION = 0.34` in `motion.ts`. Any second occurrence
    means the duplication was not actually removed.
- **Feel check**: `pnpm dev`, open the takeover menu, type a question, press the
  arrow.
  - The switch from media to panel is still invisible — the header and
    transcript must look settled at the moment the media disappears, not caught
    mid-fade. If you can see them still fading in after the switch, the delay is
    too small; report rather than guessing a new number.
  - The press feels finished noticeably sooner than before. Record both with the
    Performance panel if unsure: last paint of the staging should land at ~500ms
    from the click, not ~640ms.
  - Press X, then submit again: the second entry stages identically (no
    leftover inline delay from the exit).
  - `pnpm storybook` → `Features/MenuAsk` → Default: submitting still stages the
    panel content. That story has no docked frame, so the content motion is
    fully visible there — a useful place to watch the curve in isolation.
  - In the DevTools Animations panel at 10% playback, the header/transcript
    transition should start while the cover is still moving, not after it stops.
- **Reduced motion**: toggle `prefers-reduced-motion: reduce`. The content must
  still snap with no transition (`motion-safe:` gate) — the inline delay is
  inert because there is no transition to delay. Confirm no flash of the
  pre-stage `translate-y-2 opacity-0` state.
- **Done when**: typecheck and tests pass, `rg` shows the number exists once,
  and the feel check confirms an invisible handoff onto a settled panel that
  finishes sooner.
