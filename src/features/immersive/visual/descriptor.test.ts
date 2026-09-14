import { describe, expect, it } from 'vitest'
import type { Media } from '@/payload-types'
import {
  resolveMenuPreviewVisual,
  resolveStreakDescriptor,
  resolveVisual,
  STREAK_SEED_MAX,
  seedFromKey,
} from './descriptor'
import { STREAK_FALLBACK_LOOK } from './looks'

const image = (id: number, mimeType = 'image/jpeg'): Media =>
  ({
    id,
    mimeType,
    url: `/m/${id}`,
    filename: `${id}.jpg`,
    usageStatus: 'public-approved',
    updatedAt: '',
    createdAt: '',
  }) as Media

describe('resolveVisual', () => {
  it('keeps legacy behavior when no visual type is stored', () => {
    const media = image(1)
    expect(resolveVisual({ media })).toEqual({ kind: 'media', media })
    expect(resolveVisual({ media: 1 })).toBeNull()
    expect(resolveVisual({ media: null }, { fallbackMedia: media })).toEqual({
      kind: 'media',
      media,
    })
    expect(resolveVisual(undefined)).toBeNull()
  })

  it('treats an explicit media choice like the legacy branch', () => {
    const media = image(2)
    expect(resolveVisual({ media, visualType: 'media' })).toEqual({ kind: 'media', media })
  })

  it('lets an explicit shader win over a retained upload and a fallback', () => {
    const visual = resolveVisual(
      { media: image(3), visualType: 'streakField', shader: { preset: 'topography-v1', seed: 7 } },
      { fallbackMedia: image(4) },
    )
    expect(visual?.kind).toBe('streakField')
    if (visual?.kind !== 'streakField') throw new Error('expected a streak visual')
    expect(visual.descriptor.look).toBe('topography-v1')
    expect(visual.descriptor.seed).toBe(7)
    expect(visual.descriptor.degraded).toBe(false)
  })
})

describe('resolveStreakDescriptor', () => {
  it('normalizes null overrides to the look as shipped', () => {
    const d = resolveStreakDescriptor({ preset: 'signal-v1', seed: 1 })
    expect(d.speed).toBe(1)
    expect(d.intensity).toBe(1)
    expect(d.pointer).toBe(false)
    expect(d.posterMedia).toBeNull()
  })

  it('clamps out-of-range and rejects non-finite multipliers', () => {
    const d = resolveStreakDescriptor({
      preset: 'signal-v1',
      seed: 1,
      speed: 4,
      intensity: Number.NaN,
    })
    expect(d.speed).toBe(1)
    expect(d.intensity).toBe(1)
    expect(
      resolveStreakDescriptor({ preset: 'signal-v1', seed: 1, intensity: 0.1 }).intensity,
    ).toBe(0.5)
  })

  it('degrades an unknown preset to the fallback look, poster only', () => {
    const d = resolveStreakDescriptor({ preset: 'aurora-v9', seed: 1 })
    expect(d.look).toBe(STREAK_FALLBACK_LOOK)
    expect(d.degraded).toBe(true)
  })

  it('derives a stable seed from the slot identity when none is stored', () => {
    const a = resolveStreakDescriptor({ preset: 'signal-v1' }, { seedKey: 'work-page:12' })
    const b = resolveStreakDescriptor({ preset: 'signal-v1' }, { seedKey: 'work-page:12' })
    const c = resolveStreakDescriptor({ preset: 'signal-v1' }, { seedKey: 'work-page:13' })
    expect(a.seed).toBe(b.seed)
    expect(a.seed).not.toBe(c.seed)
    expect(Number.isInteger(a.seed)).toBe(true)
    expect(a.seed).toBeLessThanOrEqual(STREAK_SEED_MAX)
  })

  it('rejects fractional, negative and oversized stored seeds', () => {
    const derived = seedFromKey('signal-v1')
    expect(resolveStreakDescriptor({ preset: 'signal-v1', seed: 1.5 }).seed).toBe(derived)
    expect(resolveStreakDescriptor({ preset: 'signal-v1', seed: -1 }).seed).toBe(derived)
    expect(resolveStreakDescriptor({ preset: 'signal-v1', seed: STREAK_SEED_MAX + 1 }).seed).toBe(
      derived,
    )
  })

  it('accepts only image uploads as posters', () => {
    expect(
      resolveStreakDescriptor({ preset: 'signal-v1', seed: 1, posterMedia: image(9) }).posterMedia
        ?.id,
    ).toBe(9)
    expect(
      resolveStreakDescriptor({ preset: 'signal-v1', seed: 1, posterMedia: image(9, 'video/mp4') })
        .posterMedia,
    ).toBeNull()
    expect(
      resolveStreakDescriptor({ preset: 'signal-v1', seed: 1, posterMedia: 9 }).posterMedia,
    ).toBeNull()
  })
})

describe('resolveMenuPreviewVisual', () => {
  const upload = image(5)

  it('previews a legacy explicit upload and otherwise inherits', () => {
    expect(resolveMenuPreviewVisual({ menuPreview: upload })).toEqual({
      kind: 'media',
      media: upload,
    })
    expect(resolveMenuPreviewVisual({ menuPreview: null })).toBeNull()
    expect(resolveMenuPreviewVisual({ menuPreview: 5 })).toBeNull()
  })

  it('inherits on explicit automatic even when an old upload is stored', () => {
    expect(
      resolveMenuPreviewVisual({ menuPreview: upload, menuPreviewType: 'automatic' }),
    ).toBeNull()
  })

  it('previews the shader poster hover-only when chosen', () => {
    const visual = resolveMenuPreviewVisual({
      menuPreview: upload,
      menuPreviewType: 'streakField',
      menuPreviewShader: { preset: 'depth-map-v1', seed: 3 },
    })
    expect(visual?.kind).toBe('streakField')
  })

  it('inherits when media is chosen but nothing is uploaded', () => {
    expect(resolveMenuPreviewVisual({ menuPreview: null, menuPreviewType: 'media' })).toBeNull()
  })
})
