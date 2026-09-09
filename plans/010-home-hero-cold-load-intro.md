# 010 — Give the homepage a CSS-driven cold-load intro and stop re-hiding the hero at hydration

- **Status**: DONE on branch `worktree-agent-a44361c3bdc46f548` (commit f11e657, 2026-09-09); tsc, lint and vitest green; Storybook frame-verified (h1 0 to 1 monotonic by 1050ms, row by 1292ms, cover home at 483ms, settled at 1320ms, lens only after settle, reduced motion final state at frame 0); the in-app checks below are pending merge
- **Commit**: ea73161
- **Severity**: HIGH
- **Category**: Performance (rAF/JS-driven motion during page load) and Cohesion (a first frame that contradicts the entrance)
- **Estimated scope**: 7 files, ~250 lines (CSS system in `globals.css`, `HeroBand` intro phases + context, home hero markup, `HeroBackground` lens gate, story, tests, docs)
- **Depends on**: plan 009 (the bars' plate is pinned before hydration; this plan fades the bars' *contents* in and assumes the plate is already right)

## Problem

The home hero's copy is server-rendered visible, then the GSAP scroll reveal
re-hides it when the bundle hydrates and plays the 0.9s entrance from
scratch. `ScrollReveal` builds a paused timeline of `fromTo` tweens, and
GSAP renders a `fromTo` tween's start values the moment it is created
(`immediateRender` is on for `fromTo`; verified with gsap 3.15.0: a paused
timeline's `fromTo` sets the target to its `from` value synchronously). So
the sequence on every real page load is: static hero → the copy vanishes
(`visibility: hidden`, `opacity: 0`, `blur(6px)`, `y: -28px`) → the
IntersectionObserver gate fires on the next frame → the copy drops back in
over 0.9s. The reader watches the headline they were already reading blink
out and re-enter. The longer the bundle takes, the worse it reads: the site
ships about 1 MB gzipped of JavaScript (docs/performance-audit-work-pages.md),
so on ordinary connections the static window is seconds long.

Measured on production (`preview.suits-sandals.com`, Playwright, computed
styles sampled every animation frame from navigation commit):

| Run | Copy first visible | Copy hidden by GSAP | Copy back to opacity 1 | Lens canvas fades in |
| --- | --- | --- | --- | --- |
| dark scheme, unthrottled | 196ms | 511ms | 1357ms | 2068 to 2428ms |
| light scheme, 4x CPU + ~1.6Mbps | 1657ms | 9452ms | 10286ms | 13673 to 14008ms |
| local dev (`:3001`), unthrottled | 5329ms | 5715ms | 6556ms | 7522 to 7836ms |

Three things are wrong at once, and one fix covers them:

1. The entrance is JS-driven, so it waits on hydration, which is exactly the
   moment the main thread is busiest (audit rule: rAF-driven motion during
   page loads belongs in CSS, which stays smooth however busy the thread is).
2. There is no designed first frame. The page's first paint is the finished
   state, and the entrance then contradicts it.
3. The WebGL lens layer (`HeroBackground`) is created at hydration and
   cross-fades in whenever its texture lands, 1.5 to 4 seconds later, on its
   own schedule, on top of whatever else is moving.

The route transitions already define what "the page enters" looks like on
this site: a top-down mask reveal at `--vt-duration-reveal` / `--vt-ease-reveal`
(docs/route-transitions-roadmap.md §4, brand grammar: mask reveals are the
identity move, fades only blend the same media, no ambient scale). A cold
document load is the one navigation that has no transition at all. This
plan gives it the same one.

## Where

| File | Lines | What's there |
| --- | --- | --- |
| `src/Home/hero/index.tsx` | 5, 55–57, 101–142 | `ScrollReveal` import; `data-reveal` on the footer row; the band, background, `ScrollReveal` shell, `h1` and `p` markers |
| `src/Home/hero/HeroBackground.tsx` | 25, 46–61 | `useWebglMediaLayer(src)` with `active` defaulted to `true`; the 500ms opacity cross-fade of the canvas layer |
| `src/heros/HeroBand.tsx` | 135–157 | Band root (after plan 009: `pinsChromeAtLoad` prop) |
| `src/features/immersive/use-webgl-media-layer.ts` | 22–26 | The hook already takes `active` ("defer the canvas while a clip/scale reveal is still compositing") |
| `src/app/(frontend)/globals.css` | 1328–1447 | The CSS motion systems (`.reveal-section`, `.filter-swap`, `.disclosure-body`); the new system goes after the last of them |
| `src/shared/ui/view-transition/view-transition.css` | 14–24 | `--vt-duration-reveal: 480ms`, `--vt-ease-reveal: cubic-bezier(0.22, 1, 0.36, 1)` (read only, never edited here) |
| `src/shared/ui/scroll-reveal/scroll-reveal.tsx` | 102–108 | `SCROLL_REVEAL_INTRO` (textY 28, textBlurPx 6, textDuration 0.9, stagger 0.12): the language the CSS copy beat mirrors |
| `src/Home/hero/Component.stories.tsx` | 1–67 | `Heroes/Home` stories |
| `src/heros/HeroBand.test.tsx` | whole file | vitest + testing-library harness for the band |
| `docs/animations.md` | 12, 33–66 | The systems table; the Scroll reveal section |

### Current code

```tsx
// src/Home/hero/index.tsx:5
import { ScrollReveal } from '@/shared/ui/scroll-reveal'
```

```tsx
// src/Home/hero/index.tsx:55 (inside HeroFooterRow)
    <div
      data-reveal
      className={cn(
        'flex w-full shrink-0 self-stretch',
```

```tsx
// src/Home/hero/index.tsx:101 (after plan 009 the band also has `pinsChromeAtLoad`)
    <HeroBand
      // Pull under the fixed header; stop at the fixed footer so the first
      // screen is exactly header + hero + footer (page frame already pads the bottom).
      className="relative isolate -mt-(--header-height) flex h-[calc(100svh-var(--footer-height))] flex-col overflow-clip bg-background text-foreground"
    >
      {backgroundMedia && <HeroBackground media={backgroundMedia} />}

      {/* Header inset only — section height already ends at the footer. */}
      <ScrollReveal
        as="div"
        className="relative z-10 flex min-h-0 flex-1 flex-col self-stretch pt-(--header-height)"
        variant="intro"
      >
        <Container className="flex min-h-0 flex-1 flex-col py-8 sm:py-12">
          <div
            className={cn(
              'flex min-h-0 w-full flex-1 flex-col self-stretch',
              statementStackClassName[type],
            )}
          >
            {title && (
              <h1 data-reveal className={cn('font-light text-foreground', titleClassName[type])}>
                {title}
              </h1>
            )}

            {!isCenter && description && (
              <p className={descriptionClassName} data-reveal>
                {description}
              </p>
            )}
          </div>

          <HeroFooterRow
            description={description}
            featuredLabel={featuredLabel}
            post={post}
            type={type}
          />
        </Container>
      </ScrollReveal>
    </HeroBand>
```

```tsx
// src/Home/hero/HeroBackground.tsx:25
  const { enabled, ready, handleReady } = useWebglMediaLayer(src)
```

```tsx
// src/heros/HeroBand.tsx:148 (post-009)
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

```css
/* src/app/(frontend)/globals.css:1440 — the last CSS motion system before the admin-bar rules */
@media (prefers-reduced-motion: reduce) {
  .disclosure-body,
  .disclosure-body > * {
    transition: none;
  }
}
```

## Target

A **page intro** system, owned in CSS from the server-rendered markup, so it
starts at first paint, never waits on the bundle, and runs on the
compositor. `HeroBand` stamps the phase; the markup carries the markers;
the tokens live once in `globals.css`.

### Choreography (cold document load)

All times from first paint. Every number below is a token; nothing is
restated at a call site.

| Beat | Element | Motion | Start | Duration | Curve |
| --- | --- | --- | --- | --- | --- |
| Ground | the band (`bg-background`, dark) | static, on screen from frame 0 | 0 | — | — |
| Media reveal | `[data-intro-cover]`, a solid `bg-background` cover over the media group | `transform: scaleY(1) → scaleY(0)` from `transform-origin: bottom`: the cover's top edge travels down, uncovering the media top-down, the same edge and direction as `.reveal-down` and the scroll-reveal media wipe | 0 | `var(--vt-duration-reveal)` = 480ms | `var(--vt-ease-reveal)` |
| Copy, beat 0 | `h1` | `opacity 0 → 1`, `translateY(-28px) → 0`, `blur(6px) → 0` | `--intro-copy-delay` = 160ms | `--intro-copy-duration` = 900ms | `var(--ease-out-quint)` |
| Copy, beat 1 | description `p` (left layout) | same | 160 + 120 = 280ms | 900ms | same |
| Copy, beat 2 | footer row (description + featured card) | same drop and fade, **no blur** (`panel`: the card uses `backdrop-blur`) | 160 + 240 = 400ms (left) / 280ms (center, where it is beat 1) | 900ms | same |
| Chrome | the header's and footer's single `Container` child | `opacity 0 → 1`, nothing moves | `var(--vt-duration-reveal)` = 480ms (as the wipe lands) | `--intro-chrome-duration` = 400ms | `var(--ease-out-quint)` |
| Lens | `HeroBackground`'s WebGL layer | canvas is only *created* once the intro has settled (~1300ms), then its existing 500ms same-media dissolve when its texture is on the GPU | ≥ settle | 500ms (existing) | existing |

Everything is done by 1300ms (last copy beat: 400 + 900). Hierarchy per the
audit: the statement leads and gets the most screen time, the card follows,
the chrome just fades. The lens is a same-media blend, the only kind of fade
the brand grammar allows, and it now lands as the last beat instead of at a
random moment.

**Warm mounts** (client navigation to `/`, including the menu's hero
handoff and the plain undock): the copy beats only. No cover, no chrome
fade: the route reveal or the traveler already brings the page in, and the
menu handoff lands on `data-hero-media`, which must not be under a cover.

**Reduced motion**: final state, no animation, no cover, lens gate settles
immediately (the site rule: every system collapses to its final state).

**No JavaScript / hydration never arrives**: the CSS entrance still plays
to its end state and the page is fully visible; only the lens is missing.

### 1. `globals.css`: the system

Insert directly after the `.disclosure-body` reduced-motion block quoted
above (before the `/* Admin bar (components/AdminBar) ... */` comment):

```css
/* Page intro (docs/animations.md "Page intro (CSS)"): the entrance a hero
   band plays on the document's first paint, owned in CSS from the
   server-rendered markup so it starts the moment the page paints and never
   waits on the bundle. The band stamps `data-page-intro` (HeroBand `intro`,
   src/heros/HeroBand.tsx): `cold` on the document's first intro band (a real
   page load), `warm` on later mounts (client navigations, where the route
   transition already brings the page in), `settled` once every intro
   animation has finished, which releases the fills below. The GSAP scroll
   reveal cannot own this beat: it hides its targets only once the bundle
   runs, which on a cold load re-hides copy the reader was already looking
   at and replays the entrance late.

   Cold: the band's ground is on screen from the first frame; a solid cover
   (`data-intro-cover`, the band's own background) retracts downward at the
   site reveal's duration and ease (`--vt-duration-reveal` / `--vt-ease-reveal`,
   view-transition.css), so the first page enters the way every lateral
   navigation after it does; the copy (`data-intro`) drops in with the scroll
   reveal's intro language (SCROLL_REVEAL_INTRO's drop, blur, duration and
   stagger, stated here because this system is CSS), the first line starting
   a third of the way into the wipe; the fixed bars' contents fade in as the
   wipe lands, opacity only, so the frame closes around the statement while
   it settles. Warm plays the copy alone. The cover animates `transform` and
   the copy `opacity` / `transform` / `filter`, all compositor-driven as CSS
   animations, so nothing here repaints per frame or competes with hydration
   on the main thread; no `will-change` is needed for that. Reduced motion
   renders the final state, like every other system. */
:root {
  --intro-copy-y: 28px;
  --intro-copy-blur: 6px;
  --intro-copy-duration: 900ms;
  --intro-copy-stagger: 120ms;
  /* First copy beat starts a third of the way into the 480ms wipe. */
  --intro-copy-delay: 160ms;
  --intro-chrome-duration: 400ms;
}

@keyframes intro-cover {
  to {
    transform: scaleY(0);
  }
}

@keyframes intro-copy {
  from {
    opacity: 0;
    transform: translateY(calc(-1 * var(--intro-copy-y)));
    filter: blur(var(--intro-copy-blur));
  }
}

/* Same beat without the blur, for a target whose descendants use
   backdrop-filter: a filter on an ancestor would cut them off from the page
   behind them for as long as the fill holds. */
@keyframes intro-copy-panel {
  from {
    opacity: 0;
    transform: translateY(calc(-1 * var(--intro-copy-y)));
  }
}

@keyframes intro-chrome {
  from {
    opacity: 0;
  }
}

/* The cover exists only while a cold intro plays. */
[data-intro-cover] {
  display: none;
}

@media (prefers-reduced-motion: no-preference) {
  [data-page-intro="cold"] [data-intro-cover] {
    display: block;
    transform-origin: bottom;
    animation: intro-cover var(--vt-duration-reveal) var(--vt-ease-reveal) both;
  }

  /* `--intro-slot` is set inline per target (0, 1, 2 in reading order). */
  :is([data-page-intro="cold"], [data-page-intro="warm"]) [data-intro] {
    animation: intro-copy var(--intro-copy-duration) var(--ease-out-quint)
      calc(var(--intro-copy-delay) + var(--intro-copy-stagger) * var(--intro-slot, 0)) both;
  }

  :is([data-page-intro="cold"], [data-page-intro="warm"]) [data-intro="panel"] {
    animation-name: intro-copy-panel;
  }

  /* The bars live outside the band; the root-level `:has` reaches them for
     exactly as long as a cold intro is playing. `> *` is each bar's single
     Container child, so the plate itself (plan 009's pin) never fades. */
  :root:has([data-page-intro="cold"]) :is([data-site-header], [data-site-footer]) > * {
    animation: intro-chrome var(--intro-chrome-duration) var(--ease-out-quint)
      var(--vt-duration-reveal) both;
  }
}
```

`--ease-out-quint` is a `@theme` token (globals.css line 918) and is emitted
on `:root` in the compiled stylesheet (checked in `.next/static/css`), so
`var(--ease-out-quint)` resolves. `--vt-duration-reveal` and
`--vt-ease-reveal` come from `view-transition.css`, which
`DirectionalTransition` imports on every page.

### 2. `HeroBand`: intro phases and the settle context

Add to the top of `src/heros/HeroBand.tsx` (imports: add `createContext`,
`use`, `useEffect`, `useState` to the existing `react` import):

```tsx
/** How a band plays the page intro (globals.css "Page intro"). */
export type HeroIntroMode = 'auto' | 'cold' | 'warm'
type HeroIntroPhase = 'cold' | 'warm' | 'settled'

/**
 * True once any intro band has mounted in this document: the first mount is
 * a real page load, every later one a client navigation. Never mutated on
 * the server (effects do not run there), so SSR always renders `cold`,
 * which is also what the client's first render computes, so hydration
 * matches.
 */
let documentIntroPlayed = false

const HeroIntroSettledContext = createContext(true)

/**
 * `false` while the enclosing band's page intro is still playing, `true`
 * otherwise (no intro, settled, reduced motion, or no band at all). Gate
 * work that must not composite under the intro (a WebGL canvas) on it.
 */
export const useHeroIntroSettled = (): boolean => use(HeroIntroSettledContext)

/**
 * The band's intro phase. Cold or warm is decided in the state initializer,
 * so it is in the server markup and the hydration render; `settled` lands
 * when every `intro-*` CSS animation inside the band has finished. Reading
 * them through `getAnimations` rather than a timer keeps the tokens in
 * globals.css as the only timing source, and a mount that arrives after the
 * animations already ended (slow hydration) settles at once because nothing
 * is left to wait for.
 */
function useHeroIntro(
  ref: RefObject<HTMLElement | null>,
  intro: HeroIntroMode | undefined,
): HeroIntroPhase | undefined {
  const [phase, setPhase] = useState<HeroIntroPhase | undefined>(() => {
    if (!intro) return undefined
    if (intro !== 'auto') return intro
    return documentIntroPlayed ? 'warm' : 'cold'
  })

  useEffect(() => {
    if (!intro) return
    documentIntroPlayed = true
    const band = ref.current
    // No Web Animations (jsdom, very old engines): nothing to wait for.
    if (!band || typeof band.getAnimations !== 'function') {
      setPhase('settled')
      return
    }
    const intros = band
      .getAnimations({ subtree: true })
      .filter(
        (animation) =>
          animation instanceof CSSAnimation && animation.animationName.startsWith('intro-'),
      )
    let cancelled = false
    Promise.allSettled(intros.map((animation) => animation.finished)).then(() => {
      if (!cancelled) setPhase('settled')
    })
    return () => {
      cancelled = true
    }
  }, [intro, ref])

  return phase
}
```

Add the prop and wire it:

```tsx
type HeroBandProps = React.HTMLAttributes<HTMLElement> & {
  // ...existing `as`, `theme`, `pinsChromeAtLoad`...
  /**
   * Play the page intro (globals.css "Page intro"): `auto` plays the cold
   * choreography on the document's first intro band and the warm one on
   * later mounts; `cold` / `warm` force a phase (stories, demos). Stamps
   * `data-page-intro`; descendants mark their copy with `data-intro` plus an
   * inline `--intro-slot`, and a cold band renders a `data-intro-cover`.
   */
  intro?: HeroIntroMode
}

export const HeroBand: React.FC<HeroBandProps> = ({
  as = 'section',
  theme = 'dark',
  pinsChromeAtLoad = false,
  intro,
  children,
  ...props
}) => {
  const ref = useRef<HTMLElement>(null)
  useHeroChromeTheme(ref, theme)
  const phase = useHeroIntro(ref, intro)
  return createElement(
    as,
    {
      ...props,
      'data-theme': theme,
      ...(pinsChromeAtLoad ? { 'data-hero-band-pin': theme } : {}),
      ...(phase ? { 'data-page-intro': phase } : {}),
      ref,
    },
    <HeroIntroSettledContext value={phase === undefined || phase === 'settled'}>
      {children}
    </HeroIntroSettledContext>,
  )
}
```

`intro` must be destructured out so it never reaches the DOM.

### 3. Home hero markup

`src/Home/hero/index.tsx`:

- Remove the `ScrollReveal` import. Add `import type { CSSProperties } from 'react'`
  and change the `HeroBand` import to `import { HeroBand, type HeroIntroMode } from '@/heros/HeroBand'`.
- Add, next to the class-name constants:

```tsx
/** Inline stagger slot for a page-intro copy target (globals.css `--intro-slot`, reading order). */
const introSlot = (slot: number) => ({ '--intro-slot': slot }) as CSSProperties
```

- `HeroFooterRow` takes a new `slot: number` prop and replaces `data-reveal`
  with `data-intro="panel" style={introSlot(slot)}` (panel: the featured
  card uses `backdrop-blur-md`, so this row never takes a filter).
- Props: `type HomeHeroProps = HomeHeroData & { /** Page-intro override for stories and demos; the page leaves it on `auto`. */ intro?: HeroIntroMode }`.
  `RenderHomeHero` and `HomeHero` take `HomeHeroProps`; `HomeHero` destructures
  `intro = 'auto'`.
- The band and its children become:

```tsx
    <HeroBand
      // Pull under the fixed header; stop at the fixed footer so the first
      // screen is exactly header + hero + footer (page frame already pads the bottom).
      className="relative isolate -mt-(--header-height) flex h-[calc(100svh-var(--footer-height))] flex-col overflow-clip bg-background text-foreground"
      intro={intro}
      pinsChromeAtLoad
    >
      {backgroundMedia && <HeroBackground media={backgroundMedia} />}
      {/* Cold page intro only (globals.css "Page intro"): the band's own
          ground, retracting downward to uncover the media at the site
          reveal's tempo. Same negative z as the media group and a later
          sibling, so it paints over the media and under the copy. */}
      {backgroundMedia && (
        <div aria-hidden className="absolute inset-0 -z-10 bg-background" data-intro-cover />
      )}

      {/* Header inset only: section height already ends at the footer. */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col self-stretch pt-(--header-height)">
        <Container className="flex min-h-0 flex-1 flex-col py-8 sm:py-12">
          <div
            className={cn(
              'flex min-h-0 w-full flex-1 flex-col self-stretch',
              statementStackClassName[type],
            )}
          >
            {title && (
              <h1
                className={cn('font-light text-foreground', titleClassName[type])}
                data-intro="copy"
                style={introSlot(0)}
              >
                {title}
              </h1>
            )}

            {!isCenter && description && (
              <p className={descriptionClassName} data-intro="copy" style={introSlot(1)}>
                {description}
              </p>
            )}
          </div>

          <HeroFooterRow
            description={description}
            featuredLabel={featuredLabel}
            post={post}
            slot={isCenter ? 1 : 2}
            type={type}
          />
        </Container>
      </div>
    </HeroBand>
```

The wrapper `div` keeps the exact class list `ScrollReveal` rendered with,
so layout is unchanged. `description` is a required field, so the left
layout never has a gap in the slot sequence.

### 4. `HeroBackground`: create the lens only after the intro settles

```tsx
import { useHeroIntroSettled } from '@/heros/HeroBand'
// ...
  // The lens canvas waits for the page intro to settle (HeroBand): it must
  // not be created, nor upload its texture, while the cover and the copy are
  // still compositing, and its arrival becomes the entrance's last beat, a
  // same-media dissolve once its first frame is on the GPU.
  const introSettled = useHeroIntroSettled()
  const { enabled, ready, handleReady } = useWebglMediaLayer(src, introSettled)
```

Nothing else in the file changes; the 500ms `transition-opacity` stays.

### 5. Story

In `src/Home/hero/Component.stories.tsx`:

- Add `intro: 'warm'` to the meta `args` with the comment
  `// Deterministic for Chromatic: only ColdIntro plays the cold choreography.`
- Add, after `WithoutMedia`:

```tsx
/**
 * The document's first paint: cover wipe, copy settle, lens last. The site
 * chrome is not in the story, so the bars' fade is only visible in the app.
 * Re-select the story to replay.
 */
export const ColdIntro: Story = {
  args: { intro: 'cold' },
}
```

### 6. Tests (`src/heros/HeroBand.test.tsx`)

Add a `describe('page intro')`. jsdom has no `getAnimations`, so stub it per
test; a fake pending animation keeps the phase at `cold` until it resolves.

```tsx
class FakeCSSAnimation {
  animationName = 'intro-copy'
  resolve!: () => void
  finished = new Promise<void>((resolve) => {
    this.resolve = resolve
  })
}
// vi.stubGlobal('CSSAnimation', FakeCSSAnimation) in beforeEach; restore in afterEach.
// HTMLElement.prototype.getAnimations = () => [pending] (restore afterwards).
```

Cases:

1. No `intro` prop: no `data-page-intro`; a child probe calling
   `useHeroIntroSettled()` renders `true`.
2. `intro="auto"` with one pending fake animation: renders
   `data-page-intro="cold"` and the probe reads `false`; after
   `await act(async () => { pending.resolve() })` the band reads `settled`
   and the probe `true`. Unmount, render `intro="auto"` again: the band
   renders `data-page-intro="warm"` initially (same document).
3. `intro="cold"` after case 2 still renders `cold`; `intro="warm"` renders `warm`.
4. With `getAnimations` undefined (delete the stub): `intro="auto"` settles
   on mount (`data-page-intro="settled"` after render).

Order matters because the module flag persists across tests: keep 2 before 3,
or reset the module with `vi.resetModules()` + dynamic import.

### 7. Docs (`docs/animations.md`)

Add a table row directly after the "Block reveal (CSS)" row:

```md
| Page intro (CSS) | The document's first paint on the homepage: the hero's ground is there from frame 0, a cover retracts downward at the site reveal's tempo to uncover the media, the copy drops in with the intro reveal's language, the bars' contents fade in as the wipe lands, and the WebGL lens dissolves in last once the copy has settled; warm mounts (client navigations) play the copy alone | `:root` `--intro-*` tokens and the `intro-*` keyframes in `src/app/(frontend)/globals.css`; phases stamped by `HeroBand` (`intro`, `src/heros/HeroBand.tsx`) | Storybook: `Heroes/Home` ColdIntro |
```

Add a section `## Page intro` between `## Scroll reveal` and
`## The closing curtain`:

```md
## Page intro

A cold document load is the one navigation with no transition, and the hero's copy used to be re-hidden by the scroll reveal at hydration and replayed late. The page intro owns that first paint in CSS instead: it starts when the page paints, runs on the compositor, and never waits on the bundle.

- `HeroBand` with `intro="auto"` stamps `data-page-intro`: `cold` on the document's first intro band (a module flag, so a client navigation back to the page mounts `warm`), `settled` once every `intro-*` animation inside the band has finished (`getAnimations`, so the tokens stay the only timing source). Copy targets carry `data-intro="copy"` (or `"panel"` for a target whose descendants use `backdrop-filter`) plus an inline `--intro-slot` in reading order; a cold band renders a `data-intro-cover` over its media.
- Cold: the cover retracts downward at `--vt-duration-reveal` / `--vt-ease-reveal` (the lateral route reveal's own numbers, so the first page enters the way every page after it does), the copy drops in with the intro reveal's language (`--intro-copy-*`), the first line a third of the way into the wipe, and the fixed bars' single child fades in as the wipe lands (`--intro-chrome-duration`). Warm plays the copy alone: the route reveal or the menu traveler already brings the page in, and the menu handoff lands on `data-hero-media`, which must never sit under a cover.
- `useHeroIntroSettled()` is `false` until the band settles. `HeroBackground` passes it as `useWebglMediaLayer`'s `active`, so the lens canvas is created only after the entrance and its same-media dissolve becomes the last beat.
- A band that plays the intro never wraps the same copy in `ScrollReveal`: that would be a second entrance on the same targets, and it would re-hide them at hydration, the exact defect this system removes.
- Reduced motion renders the final state and settles at once.
```

**Why these values:**

- Cover: `--vt-duration-reveal` (480ms) and `--vt-ease-reveal` because the
  cold load *is* a page entering, and the site already decided what that
  looks like (roadmap §4 D1: edge wipe, top-down for lateral). Reusing the
  variables means the demo simulator's copy button retunes both at once.
- Copy: 28px / 6px / 900ms / 120ms are `SCROLL_REVEAL_INTRO` exactly, so the
  hero's copy settles the way every intro block on the site settles.
  `--ease-out-quint` is the CSS side's settle curve (globals.css comment at
  line 915); the GSAP side uses `power3.out`, one notch weaker, and the
  stronger curve suits a 900ms beat that must read as immediate.
- 160ms delay: the wipe's edge has crossed the top third of the band, where
  the headline sits, so the copy lands on uncovered media rather than on the
  cover.
- Chrome 400ms opacity-only, delayed to the wipe's end: the least important
  element just fades (audit: vary by importance), and it arrives when the
  media has finished, so the frame reads as closing around the statement.
- Lens after settle: `useWebglMediaLayer` documents `active` for exactly
  this ("defer the canvas while a clip/scale reveal is still compositing").

## Conventions to follow

- CSS motion systems live in `globals.css` with a `:root` token block and
  `@keyframes`, reduced-motion handled in place: `.reveal-section` /
  `.reveal-stagger-item` (line 1328) is the exemplar, including the inline
  per-item variable pattern (`--stagger`).
- Client state that must match SSR goes in a `useState` initializer, never an
  effect; `usePrefersReducedMotion` and `ThemeProvider` show the house forms.
- `HeroBand` owns every `data-*` stamp on the band root; pages own the
  markers on their content.
- Immersive layers gate on readiness flags, never timers:
  `src/features/immersive/use-webgl-media-layer.ts`.
- Stories for every visual change (`AGENTS.md`); `Heroes/Home` is the home.
- No em dashes in code comments, CSS, docs or the commit message. Recast the
  one existing comment you replace ("Header inset only: ...") as shown.
- `pnpm` only. No `migrate:create` (no schema change here).

## Steps

1. Execute plan 009 first (or confirm it has landed: `pinsChromeAtLoad` on
   `HeroBand`, `data-chrome-live` on the bars).
2. `globals.css`: add the Page intro block after the disclosure
   reduced-motion rule, exactly as in Target 1.
3. `HeroBand.tsx`: add the types, module flag, context, `useHeroIntro`, the
   `intro` prop, and the wiring in Target 2.
4. `src/Home/hero/index.tsx`: apply Target 3 (import changes, `introSlot`,
   `HeroFooterRow` `slot`, the cover, the plain wrapper `div`, `data-intro`
   markers, `intro` passthrough).
5. `HeroBackground.tsx`: Target 4.
6. Stories: Target 5.
7. Tests: Target 6.
8. Docs: Target 7.
9. `pnpm exec tsc --noEmit`, `pnpm lint` (Biome formats `globals.css`), then
   `pnpm exec vitest run --config ./vitest.config.mts src/heros`.
10. Run the two verification captures below and paste their output into the
    plan's Status line or the PR body.

## Out of scope

- `ScrollReveal`, `SCROLL_REVEAL_INTRO`, `reveal-variants.ts`, and every
  other block or hero keep the GSAP reveal. Only the home hero moves.
- `view-transition.css`, `DirectionalTransition`, the takeover menu, the
  hero handoff and `work-image-morph.ts` are untouched (in-flight work lives
  there).
- `HomeStatement` keeps its `ScrollReveal` (below the fold).
- Do not change `useWebglMediaLayer`, `RefractionMedia`, or `HERO_LENS`.
- Do not add `will-change` anywhere; CSS animations of transform, opacity
  and filter are promoted by the browser for their duration.
- Do not touch the `html { opacity: 0 }` theme guard (audit finding P1-9 is
  separate work).
- No new dependencies, no font-loading changes, no image priority changes.

## Verification

**Build**
- [ ] `pnpm exec tsc --noEmit` and `pnpm lint` pass.
- [ ] `src/heros/HeroBand.test.tsx` passes (all new cases).

**Behavior, Storybook (DB-free)**

Start `pnpm storybook` and run this from the repo root
(`node scratch/intro-frames.mjs`, any path outside `src/`):

```js
import { createRequire } from 'node:module'
const { chromium } = createRequire(process.cwd() + '/package.json')('@playwright/test')

const url = 'http://localhost:6006/iframe.html?id=heroes-home--cold-intro&viewMode=story'
for (const reducedMotion of ['no-preference', 'reduce']) {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion })
  await page.addInitScript(() => {
    const frames = []
    const t0 = performance.now()
    const cs = (el, p) => (el ? getComputedStyle(el).getPropertyValue(p) : null)
    const tick = () => {
      const band = document.querySelector('[data-page-intro]')
      const h1 = document.querySelector('h1')
      const row = document.querySelector('[data-intro="panel"]')
      const cover = document.querySelector('[data-intro-cover]')
      const lens = document.querySelector('[data-hero-media] > div:last-child')
      frames.push({
        t: Math.round(performance.now() - t0),
        phase: band?.getAttribute('data-page-intro') ?? null,
        h1: h1 ? [cs(h1, 'opacity'), cs(h1, 'filter')] : null,
        row: row ? [cs(row, 'opacity'), cs(row, 'filter')] : null,
        cover: cover ? [cs(cover, 'display'), cs(cover, 'transform')] : null,
        lens: lens ? cs(lens, 'opacity') : null,
      })
      if (performance.now() - t0 < 3000) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    window.__frames = frames
  })
  await page.goto(url, { waitUntil: 'commit' })
  for (const ms of [0, 120, 300, 480, 700, 1000, 1300, 1600, 2600]) {
    setTimeout(() => page.screenshot({ path: `scratch/intro-${reducedMotion}-${ms}.png` }).catch(() => {}), ms)
  }
  await page.waitForTimeout(3300)
  const frames = await page.evaluate(() => window.__frames)
  console.log(`# reducedMotion=${reducedMotion}`)
  let last = ''
  for (const f of frames) {
    const k = JSON.stringify(f).replace(/"t":\d+,/, '')
    if (k === last) continue
    last = k
    console.log(JSON.stringify(f))
  }
  await browser.close()
}
```

Expected with `no-preference`:
- [ ] The first sampled frame has `phase: "cold"`, `h1` opacity `0` with a
      `blur(6px)` filter, the row at opacity `0` with filter `none`, and the
      cover `display: block` with an identity or near-identity matrix.
- [ ] `h1` opacity never goes from a high value back to a low one (no blink),
      and reaches `1` by about 1060ms; the row reaches `1` by about 1300ms.
- [ ] The cover's transform reaches `matrix(1, 0, 0, 0, 0, 0)` (scaleY 0)
      by about 480ms and never moves again.
- [ ] `phase` becomes `settled` at about 1300ms; after that the cover reads
      `display: none` and `h1` filter reads `none` (fills released).
- [ ] `lens` is `null` until `settled`, then appears at `0` and reaches `1`
      about 500ms after the texture is ready.
- [x] Screenshots: at 120ms the cover has already retracted about three
      quarters (the reveal ease is steep at the start, exactly like the
      route reveal) and no copy is legible; at 480ms the media is fully
      uncovered and the headline is settling; at 1600ms the frame is the
      finished hero. (Verified 2026-09-09; the story imports
      `view-transition.css` so the `--vt-*` tokens resolve in Storybook.)

Expected with `reduce`:
- [ ] The first sampled frame is the finished state: `phase` `settled`
      (or `cold` for at most one frame), `h1` opacity `1`, filter `none`,
      cover `display: none`.

**Behavior, the app (needs the dev server and its database)**

Run the cold-load sampler against `/` (this is the script the audit used;
paste it to `scratch/cold-load.mjs` and run `node scratch/cold-load.mjs http://localhost:3001/ light`):

```js
import { createRequire } from 'node:module'
const { chromium } = createRequire(process.cwd() + '/package.json')('@playwright/test')
const [url = 'http://localhost:3001/', scheme = 'light'] = process.argv.slice(2)
const browser = await chromium.launch()
const page = await browser.newPage({ colorScheme: scheme, viewport: { width: 1440, height: 900 } })
await page.addInitScript(() => {
  const frames = []
  const t0 = performance.now()
  const cs = (el, p) => (el ? getComputedStyle(el).getPropertyValue(p) : null)
  const tick = () => {
    const h1 = document.querySelector('h1')
    const header = document.querySelector('[data-site-header]')
    const band = document.querySelector('[data-page-intro]')
    const lens = document.querySelector('[data-hero-media] > div:last-child')
    frames.push({
      t: Math.round(performance.now()),
      ready: document.readyState,
      phase: band?.getAttribute('data-page-intro') ?? null,
      h1: h1 ? { op: cs(h1, 'opacity'), vis: cs(h1, 'visibility'), inline: h1.getAttribute('style') } : null,
      header: header ? { transparent: cs(header, 'background-color') === 'rgba(0, 0, 0, 0)', theme: header.getAttribute('data-theme'), live: header.hasAttribute('data-chrome-live'), contentOpacity: cs(header.firstElementChild, 'opacity') } : null,
      lens: lens ? cs(lens, 'opacity') : null,
    })
    if (performance.now() - t0 < 9000) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
  window.__frames = frames
})
await page.goto(url, { waitUntil: 'commit' })
await page.waitForTimeout(9300)
const frames = await page.evaluate(() => window.__frames)
await browser.close()
let last = ''
for (const f of frames) {
  const k = JSON.stringify([f.ready, f.phase, f.h1?.vis, f.h1?.op === '1', f.h1?.op === '0', f.header, f.lens === null ? null : f.lens === '1' ? 'full' : f.lens === '0' ? 'zero' : 'mid'])
  if (k === last) continue
  last = k
  console.log(f.t + 'ms', JSON.stringify(f))
}
```

- [ ] `h1.vis` is `visible` in every frame (the GSAP `visibility: hidden`
      never appears) and `h1.inline` stays the `--intro-slot` style only (no
      GSAP-written opacity/transform).
- [ ] `h1.op` rises monotonically from `0` to `1` once; no frame after a
      high value shows a low value.
- [ ] `header.transparent` is `true` from the first frame (plan 009) and
      `contentOpacity` rises `0 → 1` between about 480ms and 880ms after
      first paint.
- [ ] `phase` goes `cold → settled` once; on a client navigation away and
      back (use the menu), the band mounts with `warm` and no cover renders.
- [ ] Repeat with `dark`.
- [ ] Emulate `prefers-reduced-motion: reduce` in DevTools and reload: the
      finished hero at first paint, no cover, chrome static, lens after
      hydration as before.
- [ ] Open the takeover menu and navigate to Home from another page: the
      hero handoff lands as before (no cover under the traveler), the copy
      drops in as it did with GSAP.
- [ ] Navigate to another page and press browser Back to `/`: warm intro,
      copy only.

**Feel**
- [ ] Record the cold load (DevTools Performance with screenshots, or a
      screen recording) and scrub frame by frame. The cover's edge should
      be fast at the top of the band and gentle as it lands; if it reads as
      a linear slide, the variable did not resolve (check
      `--vt-ease-reveal` on `:root`).
- [ ] The headline should feel like it lands on already-visible media, not
      on the cover. If it arrives on the cover, raise `--intro-copy-delay`
      toward 240ms; do not touch the wipe.
- [ ] Watch the lens arrive with the cursor at rest and then while moving
      over the hero: the dissolve must be invisible at rest (same media)
      and the warp must not flash at full strength when it appears.
- [ ] On a throttled profile (Slow 4G, 4x CPU) the entrance must be
      complete and stable long before hydration, and hydration must change
      nothing visible.
- [ ] Look at it again the next day with fresh eyes.

## Notes

- **Fonts.** Geist loads with `font-display: swap` and is preloaded; a late
  swap would previously have shown as a glyph change on the static headline.
  The copy's first ~150ms sit at low opacity under a 6px blur, which hides a
  swap inside the entrance in practice, but the plan does not gate on
  `document.fonts.ready`. If a feel-check on a cold cache still shows a
  swap, the fix is a `document.fonts.ready` gate in `useHeroIntro`, not a
  longer delay.
- **Late media.** The cover uncovers whatever is painted under it. The hero
  image is `priority` (preloaded); the production hero is a video with a
  poster. On a very slow connection the wipe can finish before the poster
  arrives, in which case it uncovers the band's ground and the poster pops
  in later, the same limitation the route reveal has. Acceptable for v1;
  the mitigation (hold the cover until `decode()` resolves, with a cap)
  would need an inline script, since it must run before hydration.
- **The theme guard.** `html { opacity: 0 }` until the theme script runs
  (globals.css end) is unchanged. If that script ever throws, the page is
  blank until hydration and the intro plays unseen; that is the audit's
  P1-9 and is fixed there, not here.
- **What the executor cannot judge from code:** whether 160ms is the right
  copy delay against this particular video, and whether the chrome fade at
  the wipe's end reads as "the frame closes" or as "the header is late".
  Both are feel-check decisions; the tokens are the only thing to move.
- **Admin bar (not in this plan).** For logged-in team members,
  `AdminBar` toggles `data-admin-bar` on `<html>` after `/api/users/me`
  resolves, which adds `--admin-bar-height` to the page frame and lifts the
  footer 2rem after hydration. Visitors never see it, but it is part of what
  the team sees on every load; it wants its own decision (reserve the space
  from a cookie, or accept the jump).
