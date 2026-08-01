'use client'

import { useState } from 'react'
import { useDemoAction, useDemoControls, useDemoSnippet } from '@/shared/ui/demo-kit'
import {
  SCROLL_REVEAL_MEDIA_DEFAULTS as MEDIA,
  ScrollReveal,
  SCROLL_REVEAL_TRIGGER_DEFAULTS as TRIGGER,
} from '@/shared/ui/scroll-reveal'

const EASES = ['power1.out', 'power2.out', 'power3.out', 'sine.out', 'expo.out', 'circ.out', 'none']

/**
 * Demo content: the production `data-reveal="media"` entrance — fade in while
 * the scale settles — with every value wired to the surrounding DemoSection's
 * GUI. A caption travels on the text track to show both in one timeline.
 */
export function ScrollRevealMediaPlayground() {
  const [replayKey, setReplayKey] = useState(0)

  const { mediaScale, mediaDuration, mediaEase } = useDemoControls('Motion', {
    mediaScale: { value: MEDIA.mediaScale, min: 1, max: 1.4, step: 0.005, label: 'from scale' },
    mediaDuration: { value: MEDIA.mediaDuration, min: 0.2, max: 3, step: 0.05, label: 'duration' },
    mediaEase: { value: MEDIA.mediaEase, options: EASES, label: 'ease' },
  })

  const { enterThreshold, exitTimeScale } = useDemoControls('Trigger', {
    enterThreshold: {
      value: TRIGGER.enterThreshold,
      min: 0,
      max: 1,
      step: 0.05,
      label: 'visible fraction',
    },
    exitTimeScale: {
      value: TRIGGER.exitTimeScale,
      min: 1,
      max: 4,
      step: 0.1,
      label: 'exit speed ×',
    },
  })

  useDemoAction('replay', () => setReplayKey((n) => n + 1))

  // Copy writes the media const only; the trigger gate has its own const in
  // the same file (SCROLL_REVEAL_TRIGGER_DEFAULTS) — transcribe it if you tune it.
  useDemoSnippet({ mediaScale, mediaDuration, mediaEase })

  return (
    <ScrollReveal
      as="div"
      className="relative overflow-hidden rounded-md bg-background px-5 py-12 sm:px-8 sm:py-16 md:px-14"
      replayKey={replayKey}
      mediaScale={mediaScale}
      mediaDuration={mediaDuration}
      mediaEase={mediaEase}
      enterThreshold={enterThreshold}
      exitTimeScale={exitTimeScale}
    >
      <div className="mx-auto max-w-xl space-y-4">
        <div
          className="aspect-video overflow-hidden rounded-md bg-linear-to-br from-chart-2 via-chart-3 to-chart-5"
          data-reveal="media"
        />
        <p
          className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
          data-reveal
        >
          data-reveal=&quot;media&quot; — scale settle, no blur
        </p>
      </div>
    </ScrollReveal>
  )
}
