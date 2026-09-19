import { z } from 'zod'

/**
 * The bespoke figure registry: one-off interactive figures that are code, not
 * data. The CMS stores an id and a small props object; everything else is
 * here. The same contract as shipped Streak Field looks:
 *
 * - An id is permanent. It ends in a version (`-v1`); a changed figure is a
 *   new id, never an edit in place.
 * - Removing an entry is a content change: keep the id until no document uses
 *   it, or the block renders nothing.
 *
 * This file is data only (ids, prop schemas, words), so the Payload config can
 * validate against it without importing a component. The components live in
 * `./components`, which must cover every id declared here.
 */

const unit = z.number().min(0).max(1)

export const BESPOKE_FIGURES = {
  'streak-curl-vs-gradient-v1': {
    label: 'Streak Field: curl versus gradient',
    props: z.strictObject({
      orient: unit
        .optional()
        .describe('How far each dash turns to face the field, 0 to 1. Default 1.'),
    }),
    textAlternative:
      'Two fields of short dashes drawn over the same height map. On the left the dashes follow the curl of the map, so they run along its contours and circle each hill like the lines on a topographic chart. On the right they follow the gradient, so they point straight up each slope and converge on the peaks. A slider turns the dashes from lying flat on their rows to facing the field fully. Same noise, same positions: only the direction rule differs.',
  },
  'streak-dash-anatomy-v1': {
    label: 'Streak Field: dash anatomy',
    props: z.strictObject({
      length: z.number().min(80).max(320).optional().describe('Dash length in px. Default 220.'),
      tail: unit.optional().describe('Head-to-tail fade, 0 to 1. Default 0.42.'),
      thickness: z.number().min(2).max(24).optional().describe('Dash thickness in px. Default 10.'),
    }),
    textAlternative:
      'One streak drawn large with its parts labelled. Length runs along the dash, between the minimum and maximum length controls. Thickness is its height. The cap control rounds the two ends. The tail control fades the dash from a bright head at the leading end to a dim tail at the trailing end; at zero the dash is flat. Sliders for length, thickness and tail redraw the dash as they move.',
  },
} as const satisfies Record<
  string,
  { label: string; props: z.ZodType<Record<string, unknown>>; textAlternative: string }
>

export type BespokeFigureId = keyof typeof BESPOKE_FIGURES

export type BespokeFigureProps<Id extends BespokeFigureId> = z.infer<
  (typeof BESPOKE_FIGURES)[Id]['props']
>

/** An id's props schema, widened so a caller can parse stored props without knowing which figure it holds. */
export const bespokePropsSchema = (id: BespokeFigureId): z.ZodType<Record<string, unknown>> =>
  BESPOKE_FIGURES[id].props

export const BESPOKE_FIGURE_IDS = Object.keys(BESPOKE_FIGURES) as BespokeFigureId[]

export const isBespokeFigureId = (value: unknown): value is BespokeFigureId =>
  typeof value === 'string' && Object.hasOwn(BESPOKE_FIGURES, value)
