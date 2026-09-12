/** A select's vocabulary entry, as Payload options and the admin panels read it. */
export type SelectOption<Value extends string = string> = { label: string; value: Value }

/** Human label for a stored value, for emails, panels and read-only summaries. */
export const optionLabel = (
  options: readonly SelectOption[],
  value?: string | null,
): string | undefined => options.find((option) => option.value === value)?.label

/** Whether a client-sent value is one of the options: the intake's guard against a widened vocabulary. */
export const isOption = <Value extends string>(
  options: readonly SelectOption<Value>[],
  value: unknown,
): value is Value => options.some((option) => option.value === value)
