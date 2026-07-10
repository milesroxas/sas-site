'use client'

import { button } from 'leva'
import { useMemo, useRef, useState } from 'react'
import { ChromaSplitText } from '@/features/immersive'
import { ScrambleText } from '@/shared/ui/scramble-text'
import { useDemoControls } from './demo-section'

const EASES = [
  'none',
  'power1.inOut',
  'power2.inOut',
  'power2.out',
  'power3.out',
  'sine.inOut',
  'expo.out',
  'expo.inOut',
]

const CHAR_SETS = ['upperCase', 'lowerCase', 'upperAndLowerCase', 'custom']
const DEFAULT_CUSTOM_CHARS = '!<>-_\\/[]{}—=+*^?#________'
const ORDERS = ['random', 'simultaneous', 'center', 'edges', 'leftToRight', 'rightToLeft'] as const

/**
 * Demo content: ScrambleText + chroma-split shader panel, every parameter
 * wired to the surrounding DemoSection's GUI. Demo-only — not shipped UI.
 */
export function ScramblePlayground() {
  const [runId, setRunId] = useState(0)
  const [scrambling, setScrambling] = useState(false)
  const sourceRef = useRef<HTMLParagraphElement>(null)

  const { from, to } = useDemoControls('Content', {
    from: { value: 'SUITS & SANDALS', label: 'sentence A' },
    to: { value: 'MAKE IT MAKE SENSE', label: 'sentence B' },
  })

  const { duration, hold, loop, ease } = useDemoControls('Timing', {
    duration: { value: 0.7, min: 0.2, max: 6, step: 0.1 },
    hold: { value: 1.2, min: 0, max: 5, step: 0.1 },
    loop: true,
    ease: { value: 'none', options: EASES },
  })

  const { charSet, customChars, speed, revealDelay, tweenLength, order } = useDemoControls(
    'Scramble',
    {
      order: { value: 'random' as (typeof ORDERS)[number], options: [...ORDERS] },
      charSet: { value: 'upperCase', options: CHAR_SETS },
      customChars: {
        value: DEFAULT_CUSTOM_CHARS,
        render: (get) => get('Scramble.charSet') === 'custom',
      },
      speed: { value: 0.4, min: 0.05, max: 2, step: 0.05 },
      revealDelay: { value: 0, min: 0, max: 2, step: 0.05 },
      tweenLength: true,
    },
  )

  const { chroma, transitionOnly, strength, chromaSpeed, wobble, angle, radial } = useDemoControls(
    'Chroma',
    {
      chroma: { value: true, label: 'enabled' },
      transitionOnly: { value: true, label: 'transition only' },
      // leva clamps number display to 2 decimals, so tiny UV offsets read as
      // "0.00" — expose strength ×1000 and scale back down where it's applied.
      strength: { value: 5, min: 0, max: 50, step: 0.5 },
      chromaSpeed: { value: 0.4, min: 0, max: 5, step: 0.1, label: 'speed' },
      wobble: { value: 0.9, min: 0, max: 1, step: 0.05 },
      angle: { value: 0, min: 0, max: 360, step: 5 },
      radial: false,
    },
  )

  useDemoControls('Actions', { replay: button(() => setRunId((n) => n + 1)) })

  const fitTexts = useMemo(() => [from, to], [from, to])

  return (
    <div className="space-y-4">
      <p ref={sourceRef} className="min-h-16 text-2xl font-medium tracking-tight">
        <ScrambleText
          key={runId}
          phrases={[from, to]}
          duration={duration}
          hold={hold}
          loop={loop}
          ease={ease}
          chars={charSet === 'custom' ? customChars : charSet}
          speed={speed}
          revealDelay={revealDelay}
          tweenLength={tweenLength}
          order={order}
          onScrambleChange={setScrambling}
        />
      </p>
      {chroma && (
        <div className="h-48 overflow-hidden rounded-md bg-zinc-950">
          <ChromaSplitText
            sourceRef={sourceRef}
            strength={strength / 1000}
            speed={chromaSpeed}
            wobble={wobble}
            angle={angle}
            radial={radial}
            active={!transitionOnly || scrambling}
            fitTexts={fitTexts}
            className="h-full w-full"
          />
        </div>
      )}
    </div>
  )
}
