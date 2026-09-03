import type { ResolvedFormField } from './types'

/** Block type of the divider that opens a step (`stepField` in the form-builder plugin). */
export const STEP_BLOCK = 'step'

/**
 * Chip value standing in for "I don't know yet". It rides in the same chip
 * group as the capabilities so the escape hatch sits where a visitor looks for
 * it, and is split back out before the request is sent. Real options are
 * numeric ids, so it can never collide with one.
 */
export const UNSURE = 'unsure'

/**
 * A field the visitor answers, as opposed to copy (`message`) or a divider
 * (`step`). One predicate for the receipt, the inquiry mapping, the step
 * summaries and the question counts, so an answerless block type added later
 * is excluded in one place.
 */
export const isQuestion = (
  field: ResolvedFormField,
): field is ResolvedFormField & { name: string } =>
  Boolean(field.name) && field.blockType !== 'message' && field.blockType !== STEP_BLOCK

/** Whether a stored value is an answer: not empty, and not an empty pick. */
export const answered = (value: unknown): boolean =>
  value !== undefined &&
  value !== null &&
  value !== '' &&
  (!Array.isArray(value) || value.length > 0)

/** What a stored answer reads as, once its option labels are applied. */
export const readable = (field: ResolvedFormField, value: unknown): string => {
  const options = field.options
  const label = (entry: string) =>
    entry === UNSURE
      ? (field.unsureLabel ?? entry)
      : (options?.find((o) => o.value === entry)?.label ?? entry)

  if (Array.isArray(value)) return value.map(String).map(label).join(', ')
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return options ? label(String(value)) : String(value)
}
