# Animations

The site's motion systems, where each lives, and the single-source-of-truth contract that keeps tuning DRY. WebGL/shader effects — plus the DOM-only `ScrambleText` — have their own doc: [immersive-effects.md](immersive-effects.md).

## The systems

| System | What it does | Source of truth | Demo / tuning surface |
|--------|--------------|-----------------|----------------------|
| Route transitions | View Transition API motion between pages: directional slides, fades, shared-element morphs, hero recede | `src/shared/ui/view-transition/view-transition.css` (`:root` timing vars + recipes); navigation types in `src/shared/lib/view-transition/constants.ts` | `/demo/transitions` — simulator with network throttle |
| Scroll reveal (GSAP) | Section entrances for work-page blocks: `data-reveal` text drops in with a blur settle, `data-reveal="media"` wipes open as a clipped window while its content settles from a zoom; two tracks synced by `mediaOffset`; reverses on exit | `src/shared/ui/scroll-reveal/scroll-reveal.tsx` — `SCROLL_REVEAL_INTRO`, `SCROLL_REVEAL_UNDER_MEDIA`, `SCROLL_REVEAL_TRIGGER_DEFAULTS` | `/demo/transitions` — one section per reveal |
| Block reveal (CSS) | Whole-block fade-up as generic page blocks and archive grids enter; optional staggered children | `src/shared/ui/reveal-section/RevealSection.tsx` + the `.reveal-section` / `.reveal-stagger-item` rules in `src/app/(frontend)/globals.css` | — (edit the CSS in place) |
| Testimonials marquee (GSAP) | Endless vertical card lanes at one shared pixel speed, alternating direction, each lane offset by a fraction of its first card | `TESTIMONIALS_MARQUEE_DEFAULTS` in `src/blocks/TestimonialsMarquee/Marquee.client.tsx` | Storybook — `Blocks/TestimonialsMarquee` |
| Immersive effects (WebGL) | Shader-driven effects: text load-ins, refraction, dispersion, floating cards | `*_DEFAULTS` per effect in `src/features/immersive` | `/demo/immersive` (micro interactions); text load-ins on `/demo/transitions` |

Two different components are named `RevealSection`: `src/shared/ui/reveal-section/` is the CSS block reveal above; `src/blocks/case-study/RevealSection.client.tsx` is the work-page shell around GSAP scroll reveal.

## Route transitions

- `DirectionalTransition` wraps every page via `src/app/(frontend)/template.tsx` and maps transition *types* to CSS classes: `nav-forward` and `nav-back` map to classes of the same name; `nav-lateral` maps to `fade-in` / `fade-out`.
- Links tag their navigation: `CMSLink` takes `transitionDirection: 'forward' | 'back' | 'lateral'` (default `lateral`); raw `next/link` takes `transitionTypes={[...forwardNavTransitionTypes]}` from `@/shared/lib/view-transition`.
- Untagged navigations (browser back/forward, revalidations) hard-cut by design — `default: 'none'`.
- All timing lives in the `:root` block of `view-transition.css` (`--vt-duration-*`, `--vt-ease-hero`, `--vt-slide-distance`). The simulator's copy button emits exactly that block.
- Elements that must not cross-fade get their own named group and `animation: none` — the header, the footer, and the persistent WebGL canvas (`.vt-global-canvas`).

## Scroll reveal

- Wrap the section in `ScrollReveal` (from `@/shared/ui/scroll-reveal`) — or `src/blocks/case-study/RevealSection.client.tsx`, a thin wrapper that adds theme, viewport sizing, and the block's `variant` — and mark descendants:
  - `data-reveal` → text track (drop from above + blur settle, staggered in document order)
  - `data-reveal="media"` → media track: the container acts as a clipped window — a top-origin mask wipes down while the first child inside scales down from `mediaScaleFrom` to rest (no fade, no blur — expensive on large media)
- The two tracks run on one timeline. `stagger` spaces consecutive targets within a track; `mediaOffset` shifts the media track against the text track (negative = media leads, `0` = synced, positive = media trails; ignored on shells with no media). Whether elements overlap falls out of those two numbers — offset past the media duration goes fully sequential.
- **Two reveals, each owned whole.** `SCROLL_REVEAL_INTRO` is the complete reveal for introduction / text-only blocks; `SCROLL_REVEAL_UNDER_MEDIA` is the complete reveal for copy paired with media (its own text tuning + the wipe + the sync offset). They share nothing but the trigger gate, so tuning one never moves the other. Blocks pick one with `variant="intro" | "underMedia"` via `RevealSection`; explicit props still win over the variant's values.
- One timeline and one viewport gate per shell; the whole entrance reverses out when the section leaves, so each pass replays. Reduced motion renders the final state; server-rendered children stay visible without JS.
- Never hand-roll a new reveal tween. If a shell needs different choreography (see `src/components/WorkIntro/Section.client.tsx`), it still imports the shared gate (`SCROLL_REVEAL_TRIGGER_DEFAULTS`) and any value one of the reveals already owns (ease, durations, the intro stagger) instead of restating it.

## The tuning workflow

1. Dial values in on the demo page — every parameter is wired to the section's GUI, with a replay button.
2. **Copy** emits code for the paste target shown in the guide (a `:root` CSS block, a `*_DEFAULTS` const, or component props).
3. Paste at the target. Every consumer reads from there — no call site restates a tuned value.

The two scroll-reveal demo sections map 1:1 onto the two reveal consts — every value of a reveal is controlled in its section, and **Copy** emits the whole const, so a paste can never drop a key. Each section also plots a to-scale timeline diagram of every target's start, with an overlap/sequential readout. The trigger gate (`SCROLL_REVEAL_TRIGGER_DEFAULTS`) is live-tunable in both but not part of either copy snippet — transcribe it manually if you change it.

## Shared foundations

- **Smooth scroll.** Lenis runs site-wide in `root` mode from `SmoothScrollProvider` (`src/providers/`), advanced on the tempus clock so it shares RAF timing with WebGL. It persists across navigations, so `LenisRouteReset` returns it to the top (or the anchor) on every route change. Reduced motion skips the provider entirely and gets native scrolling.
- **Reduced motion.** Every JS system reads `usePrefersReducedMotion` (`src/hooks/`); CSS systems gate on `prefers-reduced-motion`.
- **`scroll-fade` utilities** (`globals.css`) mask the edges of a scroll container using `animation-timeline: scroll()`, with a static-mask fallback. Size via `--scroll-fade-size`; no JS involved.

## Rules

- Every tunable number exists in exactly one place; consumers import, never restate (same contract as [immersive-effects.md](immersive-effects.md)).
- Reuse an existing system before adding a new one; a second usage of a custom tuning gets promoted to the shared source, not copied.
- `prefers-reduced-motion` collapses every system to its final state — any new motion must do the same.
- Demo playgrounds (`src/widgets/transition-demo/`, `src/widgets/immersive-demo/`) are demo-only, never shipped UI.
