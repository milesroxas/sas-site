import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { LIGHT_LEAK_PAPER } from '../../presets'
import { LIGHT_LEAK_DEFAULTS } from '../../ui/light-leak-tuning'
import { composeLeakTuning } from '../../visual/compose'
import { resolveLeakDescriptor, resolveVisual } from '../../visual/descriptor'
import { VISUAL_PLACEMENTS } from '../../visual/placement'
import {
  emptyRecipe,
  recipeFromSnapshot,
  sameSnapshot,
  snapshotRecipe,
  starterRecipe,
  validateRecipe,
} from '../recipe'
import { parseRelease } from '../release'
import {
  EFFECT_IDS,
  effectOf,
  LIGHT_LEAK_EFFECT as LEAK,
  LEAK_PLACEMENT_LIMITS,
  limitLeakTuning,
  STREAK_FIELD_EFFECT,
} from '.'

const poster = {
  filename: 'leak.webp',
  url: '/api/media/file/leak.webp',
  mimeType: 'image/webp',
  width: 1600,
  height: 900,
  updatedAt: '2026-09-19T00:00:00Z',
}
const release = (deltas = {}) => ({
  id: 9,
  sourceHash: 'b'.repeat(64),
  snapshot: snapshotRecipe(LEAK, { ...emptyRecipe(LEAK), deltas }),
  posters: { dark: poster, light: poster },
})

describe('every effect contract', () => {
  it.each(EFFECT_IDS)('%s: parameters are knobs of the defaults, and defaults pass them', (id) => {
    const effect = effectOf(id)
    for (const key of Object.keys(effect.parameters)) expect(effect.defaults).toHaveProperty(key)
    expect(validateRecipe(effect, emptyRecipe(effect))).toEqual(emptyRecipe(effect))
    expect(Object.keys(effect.looks)).toContain(effect.fallbackLook)
  })
  it.each(EFFECT_IDS)('%s: every shipped look is a valid starter that restores to itself', (id) => {
    const effect = effectOf(id)
    for (const look of Object.keys(effect.looks)) {
      const snapshot = snapshotRecipe(effect, starterRecipe(effect, look))
      expect(
        sameSnapshot(snapshotRecipe(effect, recipeFromSnapshot(effect, snapshot)), snapshot),
      ).toBe(true)
    }
  })
  it.each(EFFECT_IDS)('%s: the placement limit caps, and capping twice changes nothing', (id) => {
    const effect = effectOf(id)
    for (const placement of VISUAL_PLACEMENTS) {
      const once = effect.limit(effect.defaults, placement)
      expect(effect.limit(once, placement)).toEqual(once)
    }
  })
  // The poster renders through next/image, which answers 400 for a local path
  // outside `images.localPatterns`. Read as text: importing the config pulls
  // the Payload, Sentry and BotID wrappers into the test.
  it.each(EFFECT_IDS)('%s: next/image may optimize its poster directory', (id) => {
    const config = readFileSync(path.resolve(process.cwd(), 'next.config.ts'), 'utf8')
    expect(config).toContain(`pathname: '/images/${effectOf(id).posterDirectory}/**'`)
  })
})

describe('light leak contract', () => {
  it.each([
    { samples: 8 },
    { dpr: 2 },
    { blendMode: 'multiply' },
    { gain: 9 },
    { coolTint: [1, 1] },
    { amber: [0, 0, 1.5] },
    { excite: 'yes' },
    { force: true },
  ])('rejects code-owned, out-of-range or malformed input %o', (deltas) => {
    expect(() => validateRecipe(LEAK, { ...emptyRecipe(LEAK), deltas })).toThrow()
  })

  it('draws an untouched leak on paper as exactly the shipped paper look', () => {
    const { light, dark } = snapshotRecipe(LEAK, emptyRecipe(LEAK))
    expect(light).toEqual({ ...LIGHT_LEAK_DEFAULTS, ...LIGHT_LEAK_PAPER, excite: true })
    expect(dark.blendMode).toBe(LIGHT_LEAK_DEFAULTS.blendMode)
  })

  it('carries authored art direction to paper and translates polarity strengths by ratio', () => {
    const { light } = snapshotRecipe(LEAK, {
      ...emptyRecipe(LEAK),
      deltas: {
        coolTint: [0.9, 0.2, 1.4],
        gain: LIGHT_LEAK_DEFAULTS.gain * 2,
        blendMode: 'screen',
      },
    })
    // The author's tint is theirs on both grounds.
    expect(light.coolTint).toEqual([0.9, 0.2, 1.4])
    // Twice the default gain is twice the paper gain.
    expect(light.gain).toBeCloseTo(LIGHT_LEAK_PAPER.gain * 2)
    // The blend is the polarity: never the author's to carry.
    expect(light.blendMode).toBe('multiply')
    // A knob they left alone takes the paper value.
    expect(light.warmTint).toEqual(LIGHT_LEAK_PAPER.warmTint)
  })

  it('holds a translated strength inside its parameter', () => {
    const { light } = snapshotRecipe(LEAK, { ...emptyRecipe(LEAK), deltas: { grain: 0.2 } })
    expect(light.grain).toBe(LEAK.parameters.grain.max)
  })

  it('owns the sample count per placement and turns the flare off where the pointer is not honored', () => {
    for (const placement of VISUAL_PLACEMENTS) {
      const limited = limitLeakTuning({ ...LIGHT_LEAK_DEFAULTS, samples: 99, dpr: 3 }, placement)
      expect(limited.samples).toBe(LEAK_PLACEMENT_LIMITS[placement].samples)
      expect(limited.dpr).toBe(1)
    }
    expect(limitLeakTuning(LIGHT_LEAK_DEFAULTS, 'menu').excite).toBe(false)
  })

  it('reads a look only against the effect it is filed under', () => {
    expect(parseRelease(LEAK, release())?.snapshot.renderer).toBe(LEAK.renderer)
    expect(parseRelease(STREAK_FIELD_EFFECT, release())).toBeNull()
  })
})

describe('light leak visual slot', () => {
  const media = { id: 1, mimeType: 'image/webp', filename: 'a.webp' }

  it('is contained, enters top right and hides the media unless the editor says otherwise', () => {
    expect(resolveLeakDescriptor({ preset: 'amber-v1' }, null)).toMatchObject({
      look: 'amber-v1',
      bleed: false,
      origin: 'top-right',
      media: null,
      degraded: false,
    })
    const visual = resolveVisual({
      media,
      visualType: 'lightLeak',
      shader: { preset: 'film-v1', bleed: true, origin: 'bottom-left', showMedia: true },
    })
    expect(visual).toMatchObject({
      kind: 'lightLeak',
      descriptor: { bleed: true, origin: 'bottom-left', media },
    })
  })

  it('keeps the look’s own hover until an entry narrows it, and bounds what it stores', () => {
    const asShipped = resolveLeakDescriptor({ preset: 'film-v1', pointerInteraction: true }, null)
    expect(asShipped).toMatchObject({ targets: null, sectionExcite: null })
    const tuning = composeLeakTuning(asShipped, { surface: 'dark', placement: 'block' })
    expect(tuning.exciteTargets).toBe(LIGHT_LEAK_DEFAULTS.exciteTargets)
    expect(tuning.sectionExcite).toBe(LIGHT_LEAK_DEFAULTS.sectionExcite)

    const narrowed = resolveLeakDescriptor(
      {
        preset: 'film-v1',
        pointerInteraction: true,
        hoverTargets: 'marked',
        sectionHover: 0.4,
      },
      null,
    )
    expect(composeLeakTuning(narrowed, { surface: 'dark', placement: 'block' })).toMatchObject({
      exciteTargets: 'marked',
      sectionExcite: 0.4,
    })

    // Out of range clamps, nonsense falls back to the look, and a placement
    // that never sees the pointer reports no band response at all.
    const wild = resolveLeakDescriptor(
      { preset: 'film-v1', pointerInteraction: true, hoverTargets: 'everything', sectionHover: 9 },
      null,
    )
    expect(wild).toMatchObject({ targets: null, sectionExcite: 1 })
    expect(composeLeakTuning(wild, { surface: 'dark', placement: 'menu' })).toMatchObject({
      excite: false,
      sectionExcite: 0,
    })
  })

  it('degrades an unknown look and an unknown origin without guessing', () => {
    const descriptor = resolveLeakDescriptor({ preset: 'signal-v1', origin: 'middle' }, null)
    expect(descriptor).toMatchObject({ look: 'film-v1', degraded: true, origin: 'top-right' })
  })

  it('composes a published look, the editor multipliers and the placement cap in order', () => {
    const descriptor = resolveLeakDescriptor(
      { studio: release({ gain: 1 }), speed: 0.5, intensity: 0.5, pointerInteraction: false },
      null,
    )
    const tuning = composeLeakTuning(descriptor, { surface: 'dark', placement: 'block' })
    expect(tuning.gain).toBeCloseTo(0.5)
    expect(tuning.timeScale).toBeCloseTo(LIGHT_LEAK_DEFAULTS.timeScale * 0.5)
    expect(tuning.samples).toBe(LEAK_PLACEMENT_LIMITS.block.samples)
    expect(tuning.excite).toBe(false)
    expect(composeLeakTuning(descriptor, { surface: 'light', placement: 'block' }).blendMode).toBe(
      'multiply',
    )
  })
})
