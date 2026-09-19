'use client'

import { useMemo, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import type { VisualPlacement } from '../visual/placement'
import { STUDIO_GROUND, type Surface } from './effect'
import { type EffectId, effectOf } from './effects'
import { type Recipe, snapshotRecipe } from './recipe'
import { EFFECT_SCENES } from './scenes'

/** The Studio's stage: a look's draft, live, on a ground, at a placement's budget. */
export function StudioPreview({
  effect: effectId,
  recipe,
  placement,
  surface,
  paused,
  generation,
}: {
  effect: EffectId
  recipe: Recipe
  placement: VisualPlacement
  surface: Surface
  paused: boolean
  generation: number
}) {
  const root = useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const effect = effectOf(effectId)
  const tuning = useMemo(
    () => effect.limit(snapshotRecipe(effect, recipe)[surface], placement),
    [effect, recipe, surface, placement],
  )
  const blend = effect.blend?.(tuning)
  const Live = EFFECT_SCENES[effectId].Live

  const copy = (
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
      <p>Check contrast with real content {blend ? 'under' : 'over'} the effect.</p>
    </div>
  )

  return (
    <div
      ref={root}
      style={{
        position: 'relative',
        isolation: 'isolate',
        width: '100%',
        height: '100%',
        minHeight: 300,
        background: STUDIO_GROUND[surface],
        color: surface === 'dark' ? 'white' : '#111',
      }}
    >
      {/* A blended effect washes over the page's content; one drawn with
          alpha is the ground the content sits on. */}
      {blend && copy}
      {error ? (
        <p role="alert">{error}</p>
      ) : (
        <div style={{ position: 'absolute', inset: 0, mixBlendMode: blend }}>
          <Live
            tuning={tuning}
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
        </div>
      )}
      {!blend && copy}
    </div>
  )
}
