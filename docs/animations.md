# Animations

The site's motion systems, where each lives, and the single-source-of-truth contract that keeps tuning DRY. WebGL/shader effects have their own doc: [immersive-effects.md](immersive-effects.md).

## The systems

| System | What it does | Source of truth | Demo / tuning surface |
|--------|--------------|-----------------|----------------------|
| Route transitions | View Transition API motion between pages: directional slides, fades, shared-element morphs, hero recede | `src/shared/ui/view-transition/view-transition.css` (`:root` timing vars + recipes); types in `src/shared/lib/view-transition/constants.ts` | `/demo/transitions` — simulator with network throttle |
| Scroll reveal (GSAP) | Section entrances for content blocks: `data-reveal` text rises with a blur settle, `data-reveal="media"` fades in while scale settles; reverses on exit | `src/shared/ui/scroll-reveal/scroll-reveal.tsx` — `SCROLL_REVEAL_TEXT_DEFAULTS`, `SCROLL_REVEAL_MEDIA_DEFAULTS`, `SCROLL_REVEAL_TRIGGER_DEFAULTS` | `/demo/transitions` — text and media sections |
| Block reveal (CSS) | Whole-block fade-up as generic page blocks enter; optional staggered children | `.reveal-section` / `.reveal-stagger-item` in `globals.css`; component in `src/shared/ui/reveal-section/` | — (two CSS rules; edit in place) |
| Immersive effects (WebGL) | Shader-driven effects: text load-ins, refraction, dispersion, floating cards | `*_DEFAULTS` per effect in `src/features/immersive` | `/demo/immersive` (micro interactions); text load-ins on `/demo/transitions` |

## Route transitions

- `DirectionalTransition` wraps every page via `src/app/(frontend)/template.tsx` and maps transition *types* to CSS classes (type name === class name).
- Links tag their navigation: `CMSLink` takes `transitionDirection: 'forward' | 'back' | 'lateral'` (default `lateral`); raw `next/link` takes `transitionTypes={[...forwardNavTransitionTypes]}` from `@/shared/lib/view-transition`.
- Untagged navigations (browser back/forward, revalidations) hard-cut by design.
- All timing lives in the `:root` block of `view-transition.css` (`--vt-duration-*`, `--vt-ease-hero`, `--vt-slide-distance`). The simulator's copy button emits exactly that block.

## Scroll reveal

- Wrap the section in `ScrollReveal` (from `@/shared/ui/scroll-reveal`) — or `blocks/case-study/RevealSection.client.tsx`, a thin wrapper that only adds theme + viewport sizing — and mark descendants:
  - `data-reveal` → text track (rise + blur settle, staggered in document order)
  - `data-reveal="media"` → media track (fade + scale settle; no blur — expensive on large media)
- One timeline and one viewport gate per shell; the whole entrance reverses out when the section leaves, so each pass replays. Reduced motion renders the final state; server-rendered children stay visible without JS.
- Never hand-roll a new reveal tween. If a shell needs different choreography (see `WorkIntro/Section.client.tsx`), it still imports `SCROLL_REVEAL_TRIGGER_DEFAULTS` for the shared gate.

## The tuning workflow

1. Dial values in on the demo page — every parameter is wired to the section's GUI, with a replay button.
2. **Copy** emits code for the paste target shown in the guide (a `:root` CSS block, a `*_DEFAULTS` const, or component props).
3. Paste at the target. Every consumer reads from there — no call site restates a tuned value.

The trigger gate (`SCROLL_REVEAL_TRIGGER_DEFAULTS`) is live-tunable in both reveal demos but not part of either copy snippet — transcribe it manually if you change it.

## Rules

- Every tunable number exists in exactly one place; consumers import, never restate (same contract as [immersive-effects.md](immersive-effects.md)).
- Reuse an existing system before adding a new one; a second usage of a custom tuning gets promoted to the shared source, not copied.
- `prefers-reduced-motion` collapses every system to its final state — any new motion must do the same.
- Demo playgrounds (`src/widgets/*-demo/`) are demo-only, never shipped UI.
