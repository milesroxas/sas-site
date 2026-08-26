# 005 — Cross-fade the Ask composer's send affordance

- **Status**: TODO
- **Commit**: 25924b4
- **Severity**: LOW
- **Category**: Missed opportunities
- **Estimated scope**: 1 file (`MenuAsk.tsx`), ~15-line diff
- **Depends on**: nothing

## Problem

The submit button's icon is swapped by a ternary, so at the exact instant of the
press the arrow teleports into a spinner:

```tsx
// src/features/ask/MenuAsk.tsx:213 — current
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="submit"
                variant="default"
                size="icon-sm"
                // Comfortable thumb target inside the h-12 pill; compact on desktop.
                className="size-9 md:size-7"
                disabled={!canSend}
              >
                {busy ? <Spinner /> : <IconArrowUp />}
                <span className="sr-only">Ask</span>
              </InputGroupButton>
            </InputGroupAddon>
```

Everything else about this press is choreographed — the button compresses via
`pressable`, the cover wipes, the panel stages — and the one element the user's
finger is actually on produces a hard cut. A hard cut at the moment of contact
reads as a glitch rather than as the button acknowledging the send. It is also
the only feedback that arrives *immediately*: the wipe and the panel are up in
the window above, away from the point of contact.

## Target

Both icons stay mounted in the same grid cell and cross-fade with a small
scale, on the project's existing press tokens — this is press feedback, so it
should share the press timing rather than invent its own.

```tsx
// target
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="submit"
                variant="default"
                size="icon-sm"
                // Comfortable thumb target inside the h-12 pill; compact on desktop.
                className="size-9 md:size-7"
                disabled={!canSend}
              >
                {/* Both states stay mounted and cross-fade on the press tokens:
                    this is the only feedback that lands at the point of contact,
                    and a hard icon swap there reads as a glitch. Same grid cell,
                    so neither icon affects the button's metrics. */}
                <span className="grid place-items-center">
                  <IconArrowUp
                    className={cn(
                      'col-start-1 row-start-1 transition-[opacity,scale] [transition-duration:var(--press-duration)] [transition-timing-function:var(--press-ease)]',
                      busy && 'scale-75 opacity-0',
                    )}
                  />
                  <Spinner
                    className={cn(
                      'col-start-1 row-start-1 transition-[opacity,scale] [transition-duration:var(--press-duration)] [transition-timing-function:var(--press-ease)]',
                      !busy && 'scale-90 opacity-0',
                    )}
                  />
                </span>
                <span className="sr-only">Ask</span>
              </InputGroupButton>
            </InputGroupAddon>
```

`--press-duration` is 150ms and `--press-ease` is
`cubic-bezier(0, 0, 0.2, 1)` (`globals.css:109`), inside the 100–160ms budget
for button press feedback. Neither icon scales from 0 — 0.75 out, 0.9 in.

## Repo conventions to follow

- **Press timing is a token, merged into bespoke transition lists via arbitrary
  properties.** `globals.css:100` states it: the press vars are "Consumed by the
  `pressable` utility below and by bespoke wirings that must merge these timings
  into their own transition lists (see Home FeaturedCard)". The exemplar to
  imitate is `src/Home/hero/FeaturedCard.tsx:31`, which writes
  `[transition-timing-function:var(--press-ease)]` and
  `[transition-duration:var(--press-duration)]` exactly this way. Do not
  hardcode `150ms` or the cubic-bezier.
- **`pressable` owns the transition of the element it is on** — `Button`'s base
  class list includes `pressable` (`src/components/ui/button.tsx:8`), so no
  `transition-*` utility may go on the button itself. These transitions are on
  the two descendant `svg`s, which is allowed and does not interfere.
- `cn` is already imported in `MenuAsk.tsx:23`.

## Steps

1. **`src/features/ask/MenuAsk.tsx`** — replace the
   `{busy ? <Spinner /> : <IconArrowUp />}` line with the wrapper `<span>` and
   the two icons from Target. Leave the `InputGroupButton`'s own props, its
   `className="size-9 md:size-7"`, the `disabled={!canSend}`, and the
   `<span className="sr-only">Ask</span>` exactly as they are.

   Note on sizing, so no icon-size classes get added by mistake: `Button`'s
   default size supplies `[&_svg:not([class*='size-'])]:size-3.5` via a
   descendant selector, so it still reaches both icons inside the new wrapper.
   `Spinner` carries its own `size-4` (`src/components/ui/spinner.tsx:10`) and is
   therefore excluded from that rule — unchanged from today. The wrapper does not
   affect padding either: `inputGroupButtonVariants`' `icon-sm` sets an
   unconditional `p-0` alongside `has-[>svg]:p-0`.

## Rejected on vetting: delaying the first message's entrance

The other candidate here was that the first user message's `transcriptItemEnter`
rise (`src/features/ask/messages.tsx:14`) is consumed by the swap's occlusion —
it mounts at the press but the panel is hidden behind the docked frame until the
handoff, so the message is already settled when it becomes visible. The beat
that should sell the press never plays.

It does not survive vetting, and should not be re-raised without a design
decision first. The swap's premise, stated at `src/features/ask/MenuAsk.tsx:123`,
is that the panel is "fully drawn" at the moment the frame hides — that is what
makes the same-colour switch invisible. A message that visibly rises *after* the
switch means the panel was, by definition, not fully drawn at the switch. The two
are mutually exclusive: holding the entrance past the handoff (via
`--tw-animation-delay` + `fill-mode: backwards`) or mounting the items only at
the handoff both trade the invisible handoff for the rise. Plan 003 already takes
the version of this trade that costs nothing.

## Boundaries

- Do NOT change `src/features/ask/messages.tsx`, `transcriptItemEnter`, or
  `TranscriptItems`' signature — `src/features/ask/AskWidget.tsx:63` consumes it
  too.
- Do NOT change `src/components/ui/spinner.tsx`, `button.tsx`, or
  `input-group.tsx`. In particular, leave the pill's
  `transition-[width,background-color,border-color] duration-200 ease-in-out`
  alone — it is a separate, unselected finding.
- Do NOT change the press tokens in `globals.css`.
- Do NOT change `useAskChat`, the form, or the submit handler — `busy` already
  exists and is already wired.
- Do NOT add new dependencies.
- If the current code at the cited lines does not match the excerpts (drift
  since 25924b4), STOP and report instead of improvising.

## Verification

- **Mechanical**:
  - `pnpm exec tsc --noEmit` → no output.
  - `pnpm exec vitest run src/features/ask` → passes.
  - `pnpm exec biome check src/features/ask/MenuAsk.tsx` → clean.
- **Feel check**: `pnpm storybook` → `Features/MenuAsk` → Default. Type a
  question and press the arrow.
  - The arrow fades and shrinks slightly as the spinner fades and grows in;
    there is no frame where the button is empty and none where both icons are
    fully opaque on top of each other.
  - The button's box does not shift, resize, or nudge the pill's layout during
    the swap. If the metrics move, an icon-size class leaked in.
  - The `pressable` compress still fires on the button itself, and the release
    still springs back — the descendant transitions must not have displaced it.
  - When the answer finishes, the spinner→arrow direction reads just as clean.
  - In the DevTools Animations panel at 10% playback, confirm the two icons
    cross over near the midpoint rather than one finishing before the other
    starts.
- **Reduced motion**: toggle `prefers-reduced-motion: reduce` in the Rendering
  panel. The swap becomes effectively instant because `pressable`'s
  reduced-motion block zeroes `transition-duration` on the button, but these
  transitions are on the icons and are *not* covered by it. Report what you
  observe: a 150ms opacity-and-scale cross-fade is acceptable under reduced
  motion (it is feedback, not travel), but if it reads as too much, the follow-up
  is a `motion-safe:` prefix on the two `transition-[opacity,scale]` classes —
  do not add it speculatively.
- **Done when**: typecheck, tests, and lint pass, and the feel check shows a
  clean two-way cross-fade with no layout shift.
