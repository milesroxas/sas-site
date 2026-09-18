'use client'

import { useMemo, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { StreakFieldRuntime } from '../ui/streak-field-runtime'
import type { VisualPlacement } from '../visual/placement'
import { limitStudioTuning, type StreakRecipe, snapshotRecipe } from './recipe'

/** The grounds the stage paints under a field, and under its poster thumbnails. */
export const STUDIO_GROUND = { dark: '#090b10', light: '#f6f7fa' } as const

export function StreakStudioPreview({
  recipe,
  placement,
  surface,
  paused,
  generation,
  showStats = true,
}: {
  recipe: StreakRecipe
  placement: VisualPlacement
  surface: 'light' | 'dark'
  paused: boolean
  generation: number
  /** The count, DPR and octave line in the corner. Off when the host draws its own. */
  showStats?: boolean
}) {
  const root = useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const [error, setError] = useState('')
  const tuning = useMemo(
    () => limitStudioTuning(snapshotRecipe(recipe)[surface], placement),
    [recipe, surface, placement],
  )
  const [ready, setReady] = useState(false)
  return (
    <div
      ref={root}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 300,
        background: STUDIO_GROUND[surface],
        color: surface === 'dark' ? 'white' : '#111',
      }}
    >
      {error ? (
        <p role="alert">{error}</p>
      ) : (
        <StreakFieldRuntime
          tuning={tuning}
          dpr={tuning.dpr}
          rootRef={root}
          generation={generation}
          active={!ready || (!paused && !reducedMotion && placement !== 'card')}
          onReady={() => setReady(true)}
          onFailure={(reason) => setError(`Preview stopped: ${reason}.`)}
          onSlow={() =>
            setError(
              'Preview stopped because this device could not keep up. Reduce detail or density.',
            )
          }
        />
      )}
      <div
        style={{
          position: 'absolute',
          left: '8%',
          top: '35%',
          pointerEvents: 'none',
          maxWidth: '65%',
        }}
      >
        <strong style={{ fontSize: 32 }}>Your next visual.</strong>
        <p>Check contrast with real content over the field.</p>
      </div>
      {showStats && (
        <small style={{ position: 'absolute', bottom: 12, left: 12 }}>
          {tuning.count} particles · DPR ≤ {tuning.dpr} · {tuning.noiseOctaves} octaves
          {reducedMotion ? ' · Reduced motion' : ''}
        </small>
      )}
    </div>
  )
}
