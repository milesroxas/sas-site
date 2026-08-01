import type { CheckboxField, Condition } from 'payload'

/**
 * Admin toggle that reveals the website-only override fields placed alongside
 * it. Visibility only — hiding the fields never clears saved overrides, and
 * saved overrides still apply to the rendered page while hidden.
 */
export const showOverridesField = (): CheckboxField => ({
  name: 'showOverrides',
  type: 'checkbox',
  defaultValue: false,
  label: 'Show override fields',
  admin: {
    description:
      'Reveal the website-only override fields. Saved overrides still apply while hidden.',
  },
})

/** Pair with `showOverridesField()` to gate sibling override fields on the toggle. */
export const overridesVisible: Condition = (_, siblingData) => Boolean(siblingData?.showOverrides)
