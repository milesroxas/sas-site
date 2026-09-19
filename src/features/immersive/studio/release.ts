import type { PosterMediaSource } from '../visual/descriptor'
import { type EffectContract, parameterError, SURFACES, type Surface, type Tuning } from './effect'
import { FRAME_MAX, type Snapshot } from './recipe'

/** A published Studio look as a visual slot receives it: what `hydrateStudioFields` hands over. */
export type ReleaseDescriptor<T extends Tuning = Tuning> = {
  id: number
  sourceHash: string
  snapshot: Snapshot<T>
  posters: Record<Surface, PosterMediaSource>
}

/**
 * Whether a stored value is a whole tuning for this effect: every knob
 * present, authorable ones inside their parameter, code-owned ones of the
 * default's type. Ceilings are not restated here: whatever draws a snapshot
 * puts it through the effect's `limit` first, which holds both ends.
 */
function isTuning<T extends Tuning>(effect: EffectContract<T>, raw: unknown): raw is T {
  if (!raw || typeof raw !== 'object') return false
  const value = raw as Tuning
  return Object.entries(effect.defaults).every(([key, base]) => {
    const v = value[key]
    const spec = effect.parameters[key]
    if (spec) return parameterError(key, spec, v, { resolved: true }) === null
    if (typeof base === 'number') return typeof v === 'number' && Number.isFinite(v)
    if (Array.isArray(base))
      return (
        Array.isArray(v) &&
        v.length === base.length &&
        v.every((n) => typeof n === 'number' && Number.isFinite(n))
      )
    return typeof v === typeof base
  })
}

/**
 * Read a hydrated look for one effect. Never throws and never guesses: a look
 * filed under another effect, a malformed snapshot or a missing poster is
 * `null`, and the slot falls back to its shipped look.
 */
export function parseRelease<T extends Tuning>(
  effect: EffectContract<T>,
  raw: unknown,
): ReleaseDescriptor<T> | null {
  if (!raw || typeof raw !== 'object') return null
  const release = raw as ReleaseDescriptor<T>
  if (
    !Number.isInteger(release.id) ||
    typeof release.sourceHash !== 'string' ||
    !/^[a-f0-9]{64}$/.test(release.sourceHash)
  )
    return null
  const snapshot = release.snapshot
  if (
    !snapshot ||
    typeof snapshot.renderer !== 'string' ||
    !SURFACES.every((surface) => isTuning(effect, snapshot[surface])) ||
    !Number.isInteger(snapshot.frame) ||
    snapshot.frame < 1 ||
    snapshot.frame > FRAME_MAX
  )
    return null
  for (const surface of SURFACES) {
    const poster = release.posters?.[surface]
    if (
      !poster ||
      typeof poster.filename !== 'string' ||
      !poster.mimeType?.startsWith('image/') ||
      !poster.width ||
      !poster.height
    )
      return null
  }
  return { id: release.id, sourceHash: release.sourceHash, snapshot, posters: release.posters }
}
