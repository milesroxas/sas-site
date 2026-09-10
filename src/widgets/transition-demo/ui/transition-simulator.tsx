'use client'

import { IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { rootMs } from '@/shared/lib/view-transition'
import {
  useDemoAction,
  useDemoControls,
  useDemoSnippet,
  useSettableDemoControls,
} from '@/shared/ui/demo-kit'
import { planHeroLanding } from '@/shared/ui/hero-landing'
import {
  HERO_MEDIA_SELECTOR,
  type MockHeroLayout,
  type MockRoute,
  MockViewport,
  runFlags,
} from './mock-site'
import { PhaseTimeline } from './phase-timeline'
import { type SimDirection, type SimTimings, useSimNavigation } from './use-sim-navigation'

/**
 * Entrance curves, for the reveal and the takeover's expand: ease-out only.
 * An element entering the screen starts fast and settles (animations.dev);
 * an in-out curve would delay the exact frame the tap is waiting on, and an
 * overshooting curve cannot apply to a clip-path inset (it clamps at zero and
 * reads as a stall). Label -> CSS easing; the first entry is what ships.
 */
const ENTRANCE_EASES = {
  'site default · cubic-bezier(0.22, 1, 0.36, 1)': 'cubic-bezier(0.22, 1, 0.36, 1)',
  'quint out · cubic-bezier(0.23, 1, 0.32, 1)': 'cubic-bezier(0.23, 1, 0.32, 1)',
  'expo out · cubic-bezier(0.16, 1, 0.3, 1)': 'cubic-bezier(0.16, 1, 0.3, 1)',
  'quart out · cubic-bezier(0.25, 1, 0.5, 1)': 'cubic-bezier(0.25, 1, 0.5, 1)',
  'circ out · cubic-bezier(0, 0.55, 0.45, 1)': 'cubic-bezier(0, 0.55, 0.45, 1)',
}

/**
 * Travel curves, for the takeover's center glide: the media is already on
 * screen and moves to a new place, so it accelerates from rest and brakes to
 * a stop (ease-in-out).
 */
const TRAVEL_EASES = {
  'site default · cubic-bezier(0.77, 0, 0.175, 1)': 'cubic-bezier(0.77, 0, 0.175, 1)',
  'cubic in-out · cubic-bezier(0.645, 0.045, 0.355, 1)': 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  'quint in-out · cubic-bezier(0.83, 0, 0.17, 1)': 'cubic-bezier(0.83, 0, 0.17, 1)',
  'expo in-out · cubic-bezier(0.87, 0, 0.13, 1)': 'cubic-bezier(0.87, 0, 0.13, 1)',
}

const NETWORK_PRESETS: Record<string, number> = {
  'Local (0ms)': 0,
  'Fast 4G (~170ms)': 170,
  '3G (~500ms)': 500,
  'Slow 3G (~1.5s)': 1500,
}

const HERO_LAYOUTS: Record<string, MockHeroLayout> = {
  'landscape strip (edge to edge)': 'landscape',
  'centered media (half width)': 'centered',
}

/**
 * Slider values for the server render, where no stylesheet can be read. The
 * live `:root` block replaces them on mount (see `useTimingControls`), so the
 * panel opens on whatever `view-transition.css` currently ships.
 */
const PLACEHOLDER = {
  revealMs: 480,
  moveMs: 400,
  exitMs: 150,
  enterMs: 210,
  centerMs: 320,
  expandMs: 420,
}

const first = <T,>(options: Record<string, T>) => Object.values(options)[0] as T

/** The stylesheet's curve, matched to a menu option whitespace-insensitively (the minifier may strip spaces). */
const matchEase = (options: Record<string, string>, raw: string) => {
  const wanted = raw.replace(/\s+/g, '')
  return (
    Object.values(options).find((value) => value.replace(/\s+/g, '') === wanted) ?? first(options)
  )
}

/** Timing folders, one per `view-transition.css` recipe group. */
function useTimingControls() {
  const [{ revealMs, revealEase }, setReveal] = useSettableDemoControls('Reveal', {
    revealMs: {
      value: PLACEHOLDER.revealMs,
      min: 150,
      max: 1200,
      step: 10,
      label: 'duration (ms)',
    },
    revealEase: { value: first(ENTRANCE_EASES), options: ENTRANCE_EASES, label: 'ease' },
  })
  const [{ moveMs, morphAbovePage }, setMorph] = useSettableDemoControls('Post morph', {
    moveMs: { value: PLACEHOLDER.moveMs, min: 100, max: 1200, step: 25, label: 'duration (ms)' },
    // Not a :root variable, so Copy leaves it out; the note on the stage
    // carries the rule it previews.
    morphAbovePage: { value: false, label: 'above page (proposed)' },
  })
  const [{ exitMs, enterMs, centerMs, expandMs, heroEase, travelEase }, setTakeover] =
    useSettableDemoControls('Work takeover', {
      exitMs: { value: PLACEHOLDER.exitMs, min: 0, max: 600, step: 10, label: 'page out (ms)' },
      centerMs: {
        value: PLACEHOLDER.centerMs,
        min: 100,
        max: 1200,
        step: 10,
        label: 'center (ms)',
      },
      travelEase: { value: first(TRAVEL_EASES), options: TRAVEL_EASES, label: 'center ease' },
      expandMs: {
        value: PLACEHOLDER.expandMs,
        min: 100,
        max: 1200,
        step: 10,
        label: 'expand (ms)',
      },
      heroEase: { value: first(ENTRANCE_EASES), options: ENTRANCE_EASES, label: 'expand ease' },
      enterMs: { value: PLACEHOLDER.enterMs, min: 0, max: 600, step: 10, label: 'page in (ms)' },
    })

  // Seed the panel from the live :root block, before the override effect in
  // the simulator writes the placeholders over it. Every value the site ships
  // is then the value the panel opens on, with no number restated here.
  //
  // A passive effect on purpose: leva registers a folder's inputs in its own
  // `useEffect`, so a layout effect here would run before the store has the
  // paths and every `set` would fail. Declared after the three `useControls`
  // calls, this runs after their registration and before the override effect.
  useEffect(() => {
    const styles = getComputedStyle(document.documentElement)
    const ms = (name: string, fallback: number) => rootMs(styles, name) || fallback
    const ease = (name: string, options: Record<string, string>) =>
      matchEase(options, styles.getPropertyValue(name))
    setReveal({
      revealMs: ms('--vt-duration-reveal', PLACEHOLDER.revealMs),
      revealEase: ease('--vt-ease-reveal', ENTRANCE_EASES),
    })
    setMorph({ moveMs: ms('--vt-duration-move', PLACEHOLDER.moveMs) })
    setTakeover({
      exitMs: ms('--vt-duration-exit', PLACEHOLDER.exitMs),
      enterMs: ms('--vt-duration-enter', PLACEHOLDER.enterMs),
      centerMs: ms('--vt-duration-hero-center', PLACEHOLDER.centerMs),
      expandMs: ms('--vt-duration-hero-expand', PLACEHOLDER.expandMs),
      heroEase: ease('--vt-ease-hero', ENTRANCE_EASES),
      travelEase: ease('--vt-ease-hero-travel', TRAVEL_EASES),
    })
  }, [setReveal, setMorph, setTakeover])

  return {
    revealMs,
    revealEase,
    moveMs,
    morphAbovePage,
    exitMs,
    enterMs,
    centerMs,
    expandMs,
    heroEase,
    travelEase,
  }
}

/** Reads the browser's support for what the recipes need, after mount. */
function useTransitionEnvironment() {
  const [env, setEnv] = useState<{ vt: boolean; linear: boolean; reduced: boolean } | null>(null)
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () =>
      setEnv({
        vt: 'startViewTransition' in document,
        linear: CSS.supports('animation-timing-function', 'linear(0, 1)'),
        reduced: reduced.matches,
      })
    update()
    reduced.addEventListener('change', update)
    return () => reduced.removeEventListener('change', update)
  }, [])
  return env
}

/** Two painted frames, so a layout change has landed before anything measures or captures. */
const settleLayout = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })

/**
 * Demo content for the transitions playground: the mock viewport, the phase
 * timeline, and the GUI that (a) live-overrides every one of the site's
 * `:root` transition variables and (b) inserts the dead time a real
 * navigation spends fetching.
 */
export function TransitionSimulator() {
  const timing = useTimingControls()
  const {
    revealMs,
    revealEase,
    moveMs,
    morphAbovePage,
    exitMs,
    enterMs,
    centerMs,
    expandMs,
    heroEase,
    travelEase,
  } = timing

  // Preview of the proposed layering fix for the post-image morph: the
  // scoped rule in transition-demo.css raises the morph group above the
  // page groups while the toggle is on. Off, the run is production as-is.
  useEffect(() => {
    if (!morphAbovePage) return
    document.documentElement.classList.add('vt-sim-morph-raise')
    return () => document.documentElement.classList.remove('vt-sim-morph-raise')
  }, [morphAbovePage])

  const { preset, latencyMs, serverMs } = useDemoControls('Conditions', {
    preset: {
      value: 'Local (0ms)',
      options: [...Object.keys(NETWORK_PRESETS), 'Custom'],
      label: 'network',
    },
    latencyMs: {
      value: 800,
      min: 0,
      max: 5000,
      step: 50,
      label: 'custom latency',
      render: (get) => get('Conditions.preset') === 'Custom',
    },
    serverMs: { value: 0, min: 0, max: 3000, step: 50, label: 'server render' },
  })

  const { heroLayout } = useDemoControls('Preview', {
    heroLayout: { value: first(HERO_LAYOUTS), options: HERO_LAYOUTS, label: 'case-study hero' },
  })

  const networkMs = preset === 'Custom' ? latencyMs : (NETWORK_PRESETS[preset] ?? 0)

  // The whole :root block of view-transition.css, in its order: what the
  // override writes while mounted and what Copy emits, so a paste can never
  // drop a variable.
  const rootVars = useMemo(
    () => ({
      '--vt-duration-exit': `${exitMs}ms`,
      '--vt-duration-enter': `${enterMs}ms`,
      '--vt-duration-move': `${moveMs}ms`,
      '--vt-duration-reveal': `${revealMs}ms`,
      '--vt-ease-reveal': revealEase,
      '--vt-duration-hero-center': `${centerMs}ms`,
      '--vt-duration-hero-expand': `${expandMs}ms`,
      '--vt-ease-hero': heroEase,
      '--vt-ease-hero-travel': travelEase,
    }),
    [exitMs, enterMs, moveMs, revealMs, revealEase, centerMs, expandMs, heroEase, travelEase],
  )

  // Live-override the real :root variables while the playground is mounted;
  // every run (and any real navigation off this page) reads them, which is
  // exactly the property being tuned. Cleared on unmount.
  useEffect(() => {
    const style = document.documentElement.style
    for (const [name, value] of Object.entries(rootVars)) style.setProperty(name, value)
    return () => {
      for (const name of Object.keys(rootVars)) style.removeProperty(name)
    }
  }, [rootVars])

  useDemoSnippet(rootVars)

  const timingsRef = useRef<SimTimings>({
    networkMs,
    serverMs,
    revealMs,
    moveMs,
    exitMs,
    enterMs,
    centerMs,
    expandMs,
  })
  timingsRef.current = {
    networkMs,
    serverMs,
    revealMs,
    moveMs,
    exitMs,
    enterMs,
    centerMs,
    expandMs,
  }

  const frameRef = useRef<HTMLDivElement>(null)
  const [maximized, setMaximized] = useState(false)
  const maximizedRef = useRef(maximized)
  maximizedRef.current = maximized

  // A takeover measures the real viewport (`sequenceWorkImageMorph` centers
  // and expands against `window.inner*`), so it only plays at production
  // geometry when the window is the viewport: fill it before the run, and
  // let layout land before the spotlight is captured.
  const prepare = useCallback(async (_to: MockRoute, direction: SimDirection | null) => {
    if (direction !== 'work-open' || maximizedRef.current) return
    setMaximized(true)
    await settleLayout()
  }, [])

  // The landing the destination's hero produces, planned the way the
  // production sequencer plans it: the mask starts at the viewport (the
  // expanded media's visible crop) and closes onto the hero's rect.
  const planLanding = useCallback(() => {
    const viewport = { width: window.innerWidth, height: window.innerHeight }
    const box = { left: 0, top: 0, ...viewport }
    const hero = frameRef.current?.querySelector<HTMLElement>(HERO_MEDIA_SELECTOR)
    return planHeroLanding({
      box,
      viewport,
      target: hero?.getBoundingClientRect() ?? box,
      radius: 0,
    })
  }, [])

  const sim = useSimNavigation<MockRoute>({
    initialRoute: 'home',
    timingsRef,
    runFlags,
    prepare,
    planLanding,
  })

  useDemoAction('replay last navigation', sim.replay)

  const env = useTransitionEnvironment()

  return (
    <div className="space-y-4">
      {env && !env.vt && (
        <Alert variant="warning">
          <IconAlertTriangle aria-hidden />
          <AlertTitle>This browser has no View Transition API</AlertTitle>
          <AlertDescription>
            Navigations here will cut instantly, which is exactly how the production site degrades
            in this browser. The throttle controls still work.
          </AlertDescription>
        </Alert>
      )}
      {env?.vt && !env.linear && (
        <Alert variant="info">
          <IconInfoCircle aria-hidden />
          <AlertTitle>No linear() easing here</AlertTitle>
          <AlertDescription>
            The work takeover&apos;s beat split needs it, so this browser plays the CSS fallback: a
            single glide from spotlight to hero with a crossfade, on the same variables. Production
            does the same.
          </AlertDescription>
        </Alert>
      )}
      {env?.reduced && (
        <Alert variant="info">
          <IconInfoCircle aria-hidden />
          <AlertTitle>Reduced motion is on</AlertTitle>
          <AlertDescription>
            The site collapses every transition to an instant cut for this preference, so runs here
            will too. The timeline still plots the configured windows.
          </AlertDescription>
        </Alert>
      )}

      {morphAbovePage && (
        <Alert variant="info">
          <IconInfoCircle aria-hidden />
          <AlertTitle>Previewing the raised post morph</AlertTitle>
          <AlertDescription>
            Today the incoming page&apos;s snapshot paints over the morph group, so the image ducks
            under the wipe and only reappears in the hero. This run raises the group above the page
            groups, still under site-header. To ship it, add one declaration in view-transition.css:{' '}
            <code className="font-mono text-foreground/90">
              ::view-transition-group(.morph) {'{'} z-index: 1; {'}'}
            </code>
          </AlertDescription>
        </Alert>
      )}

      <MockViewport
        route={sim.route}
        phase={sim.phase}
        navigate={sim.navigate}
        canGoBack={sim.canGoBack}
        onBrowserBack={sim.browserBack}
        heroLayout={heroLayout}
        maximized={maximized}
        onMaximizedChange={setMaximized}
        frameRef={frameRef}
      />

      <PhaseTimeline run={sim.lastRun} />
    </div>
  )
}
