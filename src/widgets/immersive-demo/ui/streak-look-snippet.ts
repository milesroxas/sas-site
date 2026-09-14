import { STREAK_FIELD_DEFAULTS as DEFAULTS, type StreakFieldProps } from '@/features/immersive'
import { formatObjectValue } from '@/shared/ui/demo-kit/format-snippet'

/**
 * Turns the playground's applied props into the two blocks that ship a Streak
 * Field look: a delta-only preset for `presets.ts` and its `STREAK_LOOKS`
 * entry for `visual/looks.ts`. That table is what the admin Look picker on
 * every visual slot reads, so pasting both is the whole registration; posters
 * and the revision bump follow (`docs/streak-field.md`, "Adding a look").
 *
 * The preset holds only what differs from `STREAK_FIELD_DEFAULTS`, so it
 * never restates a default. Two panel values never make it into a look:
 * `surface`, which the page ground decides at render time (the light-ground
 * delta is folded in by `composeStreakTuning`), and `seed`, which the CMS
 * assigns per entry.
 */

/** Panel keys a look cannot own, with the reason each stays out. */
const NOT_LOOK_KEYS = ['surface', 'seed'] as const satisfies (keyof typeof DEFAULTS)[]

type LookKey = Exclude<keyof typeof DEFAULTS, (typeof NOT_LOOK_KEYS)[number]>

/** How close a slider or colour-picker round trip may sit to a default and still count as it. */
const EPSILON = 0.002

const sameValue = (a: unknown, b: unknown): boolean => {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < EPSILON
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => sameValue(item, b[index]))
  }
  return a === b
}

/** The props that differ from the defaults, in the defaults table's key order. */
export function streakLookDelta(props: Partial<StreakFieldProps>): Partial<StreakFieldProps> {
  const delta: Partial<StreakFieldProps> = {}
  for (const key of Object.keys(DEFAULTS) as (keyof typeof DEFAULTS)[]) {
    if ((NOT_LOOK_KEYS as readonly string[]).includes(key)) continue
    const value = props[key]
    if (value === undefined || sameValue(value, DEFAULTS[key])) continue
    ;(delta as Record<LookKey, unknown>)[key as LookKey] = value
  }
  return delta
}

export type StreakLookNaming = {
  /** Stored id, `<slug>-v1`. */
  id: string
  /** Picker label. */
  label: string
  /** The preset's const name, `STREAK_FIELD_<SLUG>`. */
  symbol: string
}

const FALLBACK_NAME = 'New look'

const slugify = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** Id, label and const name from the name typed into the panel. */
export function streakLookNaming(name: string): StreakLookNaming {
  const label = name.trim() || FALLBACK_NAME
  const slug = slugify(label) || slugify(FALLBACK_NAME)
  // A typed `-v2` suffix is the author versioning a look; keep it.
  const id = /-v\d+$/.test(slug) ? slug : `${slug}-v1`
  const symbol = `STREAK_FIELD_${id
    .replace(/-v\d+$/, '')
    .replace(/-/g, '_')
    .toUpperCase()}`
  return { id, label, symbol }
}

/** Fold a picker description into a doc comment; empty falls back to a prompt for one. */
const sentence = (text: string) => {
  const trimmed = text.trim()
  if (!trimmed) return ''
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`
}

export type StreakLookSnippetInput = {
  name: string
  description: string
  props: Partial<StreakFieldProps>
}

/** The clipboard payload for the Streak Field section: preset block, then look entry. */
export function formatStreakLookSnippet({
  name,
  description,
  props,
}: StreakLookSnippetInput): string {
  const { id, label, symbol } = streakLookNaming(name)
  const delta = streakLookDelta(props)
  const motion = props.motion ?? DEFAULTS.motion
  const blurb = sentence(description) || 'One line for the picker.'

  const body = Object.entries(delta)
    .map(([key, value]) => `  ${key}: ${formatObjectValue(value)},`)
    .join('\n')
  const preset = body ? `{\n${body}\n}` : '{}'

  return [
    '// src/features/immersive/presets.ts',
    '/**',
    ` * ${label}: dialed in on /demo/immersive. ${blurb}`,
    ' * Say what the art direction is, not only the numbers, before this ships.',
    ' */',
    `export const ${symbol} = ${preset} as const satisfies Partial<StreakFieldProps>`,
    '',
    `// src/features/immersive/visual/looks.ts: import ${symbol} from '../presets', then in STREAK_LOOKS`,
    `  '${id}': look({`,
    `    id: '${id}',`,
    `    label: ${formatObjectValue(label)},`,
    `    description: ${formatObjectValue(blurb)},`,
    `    motion: '${motion}',`,
    `    tuning: ${symbol},`,
    '  }),',
  ].join('\n')
}
