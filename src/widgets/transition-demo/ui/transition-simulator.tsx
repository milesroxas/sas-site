'use client'

import { IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react'
import { button } from 'leva'
import { useEffect, useRef, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useDemoControls, useDemoSnippet } from '@/shared/ui/demo-kit'
import { type MockRoute, MockViewport, runFlags } from './mock-site'
import { PhaseTimeline } from './phase-timeline'
import { type SimTimings, useSimNavigation } from './use-sim-navigation'

/** Label → CSS easing. The first entry is what `--vt-ease-hero` ships with. */
const HERO_EASES = {
  'site default — cubic-bezier(0.22, 1, 0.36, 1)': 'cubic-bezier(0.22, 1, 0.36, 1)',
  'expo out — cubic-bezier(0.16, 1, 0.3, 1)': 'cubic-bezier(0.16, 1, 0.3, 1)',
  'back out — cubic-bezier(0.34, 1.56, 0.64, 1)': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'ease-in-out': 'ease-in-out',
}

const NETWORK_PRESETS: Record<string, number> = {
  'Local (0ms)': 0,
  'Fast 4G (~170ms)': 170,
  '3G (~500ms)': 500,
  'Slow 3G (~1.5s)': 1500,
}

const VT_VARS = [
  '--vt-duration-exit',
  '--vt-duration-enter',
  '--vt-duration-move',
  '--vt-duration-hero',
  '--vt-ease-hero',
  '--vt-slide-distance',
] as const

/**
 * Demo content for the transitions playground: the mock viewport, the phase
 * timeline, and the GUI that (a) live-overrides the site's `:root` transition
 * variables and (b) inserts the dead time a real navigation spends fetching.
 */
export function TransitionSimulator() {
  const { exitMs, enterMs, moveMs, heroMs, heroEase, slidePx } = useDemoControls('Timing', {
    exitMs: { value: 150, min: 50, max: 500, step: 10, label: 'exit fade' },
    enterMs: { value: 210, min: 50, max: 700, step: 10, label: 'enter fade' },
    moveMs: { value: 400, min: 100, max: 1200, step: 25, label: 'slide / morph' },
    heroMs: { value: 560, min: 100, max: 1500, step: 20, label: 'hero recede' },
    heroEase: { value: 'cubic-bezier(0.22, 1, 0.36, 1)', options: HERO_EASES, label: 'hero ease' },
    slidePx: { value: 60, min: 0, max: 240, step: 5, label: 'slide distance' },
  })

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

  const networkMs = preset === 'Custom' ? latencyMs : (NETWORK_PRESETS[preset] ?? 0)

  // Live-override the real :root variables while the playground is mounted —
  // every run (and any real navigation off this page) reads them, which is
  // exactly the property being tuned. Cleared on unmount.
  useEffect(() => {
    const style = document.documentElement.style
    style.setProperty('--vt-duration-exit', `${exitMs}ms`)
    style.setProperty('--vt-duration-enter', `${enterMs}ms`)
    style.setProperty('--vt-duration-move', `${moveMs}ms`)
    style.setProperty('--vt-duration-hero', `${heroMs}ms`)
    style.setProperty('--vt-ease-hero', heroEase)
    style.setProperty('--vt-slide-distance', `${slidePx}px`)
    return () => {
      for (const name of VT_VARS) style.removeProperty(name)
    }
  }, [exitMs, enterMs, moveMs, heroMs, heroEase, slidePx])

  const timingsRef = useRef<SimTimings>({ networkMs, serverMs, exitMs, enterMs, moveMs, heroMs })
  timingsRef.current = { networkMs, serverMs, exitMs, enterMs, moveMs, heroMs }

  const sim = useSimNavigation<MockRoute>({
    initialRoute: 'home',
    timingsRef,
    runFlags,
  })

  // leva's button captures its closure once; route the click through a ref so
  // it always replays with the current run and settings.
  const replayRef = useRef(sim.replay)
  replayRef.current = sim.replay
  useDemoControls('Actions', { 'replay last navigation': button(() => replayRef.current()) })

  useDemoSnippet({
    '--vt-duration-exit': `${exitMs}ms`,
    '--vt-duration-enter': `${enterMs}ms`,
    '--vt-duration-move': `${moveMs}ms`,
    '--vt-duration-hero': `${heroMs}ms`,
    '--vt-ease-hero': heroEase,
    '--vt-slide-distance': `${slidePx}px`,
  })

  // Read after mount: no matchMedia/document on the server render.
  const [env, setEnv] = useState<{ vt: boolean; reduced: boolean } | null>(null)
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setEnv({ vt: 'startViewTransition' in document, reduced: reduced.matches })
    update()
    reduced.addEventListener('change', update)
    return () => reduced.removeEventListener('change', update)
  }, [])

  return (
    <div className="space-y-4">
      {env && !env.vt && (
        <Alert variant="warning">
          <IconAlertTriangle aria-hidden />
          <AlertTitle>This browser has no View Transition API</AlertTitle>
          <AlertDescription>
            Navigations here will cut instantly — which is exactly how the production site degrades
            in this browser. The throttle controls still work.
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

      <MockViewport
        route={sim.route}
        phase={sim.phase}
        navigate={sim.navigate}
        canGoBack={sim.canGoBack}
        onBrowserBack={sim.browserBack}
      />

      <PhaseTimeline run={sim.lastRun} />
    </div>
  )
}
