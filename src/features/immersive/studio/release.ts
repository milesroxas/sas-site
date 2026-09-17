import { STREAK_FIELD_DEFAULTS, type StreakFieldTuning } from '../ui/streak-field-tuning'
import type { PosterMediaSource } from '../visual/descriptor'
import { STREAK_PARAMETERS, type StreakSnapshot } from './recipe'

export type ReleaseDescriptor = {
  id: number
  sourceHash: string
  snapshot: StreakSnapshot
  posters: { dark: PosterMediaSource; light: PosterMediaSource }
}

function isTuning(raw: unknown): raw is StreakFieldTuning {
  if (!raw || typeof raw !== 'object') return false
  const value = raw as Record<string, unknown>
  for (const [key, base] of Object.entries(STREAK_FIELD_DEFAULTS)) {
    const v = value[key]
    if (typeof base === 'number' && (typeof v !== 'number' || !Number.isFinite(v))) return false
    if (typeof base === 'string') {
      const spec = STREAK_PARAMETERS[key as keyof typeof STREAK_PARAMETERS]
      if (
        key === 'surface'
          ? !['dark', 'light'].includes(String(v))
          : !spec || !('options' in spec) || !(spec.options as readonly unknown[]).includes(v)
      )
        return false
    }
    if (
      Array.isArray(base) &&
      (!Array.isArray(v) ||
        v.length !== 3 ||
        v.some((n) => typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 1))
    )
      return false
  }
  return (
    Number.isInteger(value.count) &&
    Number(value.count) > 0 &&
    Number(value.count) <= 8000 &&
    value.segments === 1 &&
    Number(value.dpr) <= 1.5 &&
    Number(value.dpr) >= 1 &&
    Number(value.noiseOctaves) >= 1 &&
    Number(value.noiseOctaves) <= 3
  )
}

export function parseRelease(raw: unknown): ReleaseDescriptor | null {
  if (!raw || typeof raw !== 'object') return null
  const release = raw as ReleaseDescriptor
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
    !isTuning(snapshot.dark) ||
    !isTuning(snapshot.light) ||
    !Number.isInteger(snapshot.frame) ||
    snapshot.frame < 1 ||
    snapshot.frame > 600
  )
    return null
  for (const surface of ['dark', 'light'] as const) {
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
