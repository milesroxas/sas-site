'use client'

import { IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useDemoAction, useDemoControls, useDemoSnippet } from '@/shared/ui/demo-kit'
import { type MockRoute, MockViewport, runFlags } from './mock-site'
import { PhaseTimeline } from './phase-timeline'
import { type SimTimings, useSimNavigation } from './use-sim-navigation'

/** Label → CSS easing. The first entry is what the site's eases ship with. */
const EASES = {
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

const VT_VARS = ['--vt-duration-reveal', '--vt-ease-reveal', '--vt-duration-move'] as const

/**
 * Demo content for the transitions playground: the mock viewport, the phase
 * timeline, and the GUI that (a) live-overrides the site's `:root` transition
 * variables and (b) inserts the dead time a real navigation spends fetching.
 */
export function TransitionSimulator() {
  const { revealMs, revealEase, moveMs } = useDemoControls('Timing', {
    revealMs: { value: 480, min: 150, max: 1200, step: 10, label: 'mask reveal' },
    revealEase: {
      value: 'cubic-bezier(0.22, 1, 0.36, 1)',
      options: EASES,
      label: 'reveal ease',
    },
    moveMs: { value: 400, min: 100, max: 1200, step: 25, label: 'morph' },
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
    style.setProperty('--vt-duration-reveal', `${revealMs}ms`)
    style.setProperty('--vt-ease-reveal', revealEase)
    style.setProperty('--vt-duration-move', `${moveMs}ms`)
    return () => {
      for (const name of VT_VARS) style.removeProperty(name)
    }
  }, [revealMs, revealEase, moveMs])

  const timingsRef = useRef<SimTimings>({ networkMs, serverMs, revealMs, moveMs })
  timingsRef.current = { networkMs, serverMs, revealMs, moveMs }

  const sim = useSimNavigation<MockRoute>({
    initialRoute: 'home',
    timingsRef,
    runFlags,
  })

  useDemoAction('replay last navigation', sim.replay)

  useDemoSnippet({
    '--vt-duration-reveal': `${revealMs}ms`,
    '--vt-ease-reveal': revealEase,
    '--vt-duration-move': `${moveMs}ms`,
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
