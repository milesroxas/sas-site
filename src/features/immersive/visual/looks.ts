import {
  STREAK_FIELD_BACKDROP,
  STREAK_FIELD_DEPTH_MAP,
  STREAK_FIELD_TECHNICAL_B2B,
  STREAK_FIELD_TECHNICAL_LINES,
  STREAK_FIELD_TOPOGRAPHY,
} from '../presets'
import type { StreakFieldProps } from '../ui/streak-field'

/**
 * The Streak Field looks an editor can pick as a visual (`docs/streak-field-media-plan.md`,
 * "Content contract"). Stable, versioned ids stored as text in Payload and
 * validated against this table on the server; the tuning behind each id
 * lives in `../presets.ts` as delta-only presets, and the rest falls through
 * to `STREAK_FIELD_DEFAULTS` inside the runtime. Nothing here imports Three,
 * so the Payload config, server resolvers, and the poster path can read it.
 *
 * Bump `STREAK_LOOK_REVISION` when shared defaults or a shipped look change
 * in a way that invalidates rendered derivatives (posters, stills): Payload
 * revisions version content, not deployed TypeScript.
 */
export const STREAK_LOOK_REVISION = 2

export type StreakLookMotion = 'drift' | 'flow'

export type StreakLook = {
  id: string
  label: string
  /** One line for the admin picker. */
  description: string
  /** `flow` looks need a renderable float target; the runtime gates them. */
  motion: StreakLookMotion
  /** Delta-only tuning against `STREAK_FIELD_DEFAULTS`. Never restates a default. */
  tuning: Partial<StreakFieldProps>
}

const look = <T extends StreakLook>(value: T) => value

/**
 * Shipped looks, in picker order. Keys are the stored ids. Removing an id is
 * a content change: keep its poster and entry until every document that
 * stores it has been updated.
 */
export const STREAK_LOOKS = {
  'signal-v1': look({
    id: 'signal-v1',
    label: 'Signal',
    description: 'A fine tick grid lit by a slow relief, creeping right. The default field.',
    motion: 'drift',
    tuning: {},
  }),
  'backdrop-v1': look({
    id: 'backdrop-v1',
    label: 'Quiet backdrop',
    description: 'Sparse and slow: a calm field for copy to sit on.',
    motion: 'drift',
    tuning: STREAK_FIELD_BACKDROP,
  }),
  'topography-v1': look({
    id: 'topography-v1',
    label: 'Topography',
    description: 'A tick grid streaming along the contours of a height map, lit by altitude.',
    motion: 'flow',
    tuning: STREAK_FIELD_TOPOGRAPHY,
  }),
  'depth-map-v1': look({
    id: 'depth-map-v1',
    label: 'Depth map',
    description: 'The same grid leaning up the slope, with only the crests lit.',
    motion: 'flow',
    tuning: STREAK_FIELD_DEPTH_MAP,
  }),
  'technical-lines-v1': look({
    id: 'technical-lines-v1',
    label: 'Technical Lines',
    description: 'Thin, long strokes in a cooler blue: a sparse schematic, not a tick grid.',
    motion: 'drift',
    tuning: STREAK_FIELD_TECHNICAL_LINES,
  }),
  'technical-b2b-v1': look({
    id: 'technical-b2b-v1',
    label: 'Technical B2B',
    description:
      'A sparse grid of bent dashes streaming along a simplex field. Cyan schematic, not a tick sheet.',
    motion: 'flow',
    tuning: STREAK_FIELD_TECHNICAL_B2B,
  }),
} as const satisfies Record<string, StreakLook>

export type StreakLookId = keyof typeof STREAK_LOOKS

export const STREAK_LOOK_IDS = Object.keys(STREAK_LOOKS) as StreakLookId[]

/** The look an unknown or missing id degrades to; its poster is the known background. */
export const STREAK_FALLBACK_LOOK: StreakLookId = 'signal-v1'

export const isStreakLookId = (value: unknown): value is StreakLookId =>
  typeof value === 'string' && Object.hasOwn(STREAK_LOOKS, value)
