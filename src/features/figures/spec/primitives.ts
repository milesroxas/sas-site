import { z } from 'zod'
import { FIGURE_LIMITS, SPEC_VERSION } from './limits'

/**
 * The scalar vocabulary every spec is built from. Labels are plain text: the
 * renderers only ever emit them as text nodes, so markup in a label is inert,
 * and control characters are refused because nothing legitimate needs one.
 */
export const label = z
  .string()
  .trim()
  .min(1, 'must not be empty')
  .max(FIGURE_LIMITS.label)
  .refine((value) => !/\p{Cc}/u.test(value), 'must not contain control characters')

/** Stable reference inside one spec: a node, group or actor. */
export const id = z
  .string()
  .max(FIGURE_LIMITS.id)
  .regex(/^[a-z][a-z0-9-]*$/, 'use lowercase letters, numbers and hyphens, starting with a letter')

/** A column name in chart rows. Never reaches CSS or markup: series render through fixed slots. */
export const dataKey = z
  .string()
  .max(FIGURE_LIMITS.id)
  .regex(/^[A-Za-z][A-Za-z0-9_]*$/, 'use letters, numbers and underscores, starting with a letter')

/** A calendar date, `YYYY-MM-DD`. Figures are static, so no time of day and no zone. */
export const isoDate = z.iso.date('use a calendar date, YYYY-MM-DD')

export const specVersion = z.literal(SPEC_VERSION, {
  error: `specVersion must be ${SPEC_VERSION}`,
})

/** Issue reporter handed to a cross-field check: a message pinned to a path inside the spec. */
export type Report = (path: PropertyKey[], message: string) => void

export const reporter =
  (ctx: z.core.$RefinementCtx): Report =>
  (path, message) =>
    ctx.addIssue({ code: 'custom', message, path })

/** Indexes of every entry whose key repeats an earlier one. */
export const duplicateIndexes = <T>(items: readonly T[], keyOf: (item: T) => string): number[] => {
  const seen = new Set<string>()
  return items.flatMap((item, index) => {
    const key = keyOf(item)
    if (seen.has(key)) return [index]
    seen.add(key)
    return []
  })
}
