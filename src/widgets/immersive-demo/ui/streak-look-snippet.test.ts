import { describe, expect, it } from 'vitest'
import { STREAK_FIELD_DEFAULTS as DEFAULTS, STREAK_FIELD_TOPOGRAPHY } from '@/features/immersive'
import { formatStreakLookSnippet, streakLookDelta, streakLookNaming } from './streak-look-snippet'

describe('streakLookDelta', () => {
  it('is empty when every prop is the default', () => {
    expect(streakLookDelta({ ...DEFAULTS })).toEqual({})
  })

  it('keeps only the props that differ, in table order', () => {
    const delta = streakLookDelta({ ...DEFAULTS, ...STREAK_FIELD_TOPOGRAPHY })
    // The shipped preset restates a couple of zeros; a copied look never does.
    const changed = Object.entries(STREAK_FIELD_TOPOGRAPHY).filter(
      ([key, value]) => DEFAULTS[key as keyof typeof DEFAULTS] !== value,
    )
    expect(delta).toEqual(Object.fromEntries(changed))
    expect(Object.keys(delta)).toEqual(
      Object.keys(DEFAULTS).filter((key) => changed.some(([changedKey]) => changedKey === key)),
    )
  })

  it('never carries the ground or the seed into a look', () => {
    expect(streakLookDelta({ ...DEFAULTS, surface: 'light', seed: 42 })).toEqual({})
  })

  it('treats a colour that round tripped the 8-bit picker as the default', () => {
    expect(streakLookDelta({ ...DEFAULTS, ink: [0.5176, 0.6549, 1] })).toEqual({})
    expect(streakLookDelta({ ...DEFAULTS, ink: [1, 1, 1] })).toEqual({ ink: [1, 1, 1] })
  })
})

describe('streakLookNaming', () => {
  it('derives the stored id, label and const from a typed name', () => {
    expect(streakLookNaming('  Night rain ')).toEqual({
      id: 'night-rain-v1',
      label: 'Night rain',
      symbol: 'STREAK_FIELD_NIGHT_RAIN',
    })
  })

  it('keeps a version the author typed', () => {
    expect(streakLookNaming('Topography v2')).toEqual({
      id: 'topography-v2',
      label: 'Topography v2',
      symbol: 'STREAK_FIELD_TOPOGRAPHY',
    })
  })

  it('falls back to a placeholder name', () => {
    expect(streakLookNaming('   ')).toEqual({
      id: 'new-look-v1',
      label: 'New look',
      symbol: 'STREAK_FIELD_NEW_LOOK',
    })
  })
})

describe('formatStreakLookSnippet', () => {
  it('emits the preset and the look entry the picker reads', () => {
    const code = formatStreakLookSnippet({
      name: 'Night rain',
      description: 'Sparse dots falling through a slow field',
      props: { ...DEFAULTS, shape: 'dot', motion: 'flow', ink: [0.5, 0.25, 1] },
    })
    expect(code).toBe(
      [
        '// src/features/immersive/presets.ts',
        '/**',
        ' * Night rain: dialed in on /demo/immersive. Sparse dots falling through a slow field.',
        ' * Say what the art direction is, not only the numbers, before this ships.',
        ' */',
        'export const STREAK_FIELD_NIGHT_RAIN = {',
        "  shape: 'dot',",
        "  motion: 'flow',",
        '  ink: [0.5, 0.25, 1],',
        '} as const satisfies Partial<StreakFieldProps>',
        '',
        "// src/features/immersive/visual/looks.ts: import STREAK_FIELD_NIGHT_RAIN from '../presets', then in STREAK_LOOKS",
        "  'night-rain-v1': look({",
        "    id: 'night-rain-v1',",
        "    label: 'Night rain',",
        "    description: 'Sparse dots falling through a slow field.',",
        "    motion: 'flow',",
        '    tuning: STREAK_FIELD_NIGHT_RAIN,',
        '  }),',
      ].join('\n'),
    )
  })

  it('emits an empty preset and a prompt when nothing was tuned or described', () => {
    const code = formatStreakLookSnippet({ name: '', description: '', props: { ...DEFAULTS } })
    expect(code).toContain(
      'export const STREAK_FIELD_NEW_LOOK = {} as const satisfies Partial<StreakFieldProps>',
    )
    expect(code).toContain("description: 'One line for the picker.',")
    expect(code).toContain("motion: 'drift',")
  })
})
