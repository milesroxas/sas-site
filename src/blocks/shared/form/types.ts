import type { Form } from '@/payload-types'

export type FormFieldOption = { label: string; value: string }

/**
 * A form-builder field with everything the browser needs already decided.
 *
 * The stored field points at other documents (a capability chip set names
 * taxonomy terms by id), so the server resolves those to plain label/value
 * pairs before the field crosses to the client. Same shape whatever the
 * source, so one renderer serves every form on the site.
 */
export type ResolvedFormField = {
  blockType: string
  name?: string
  label?: string | null
  required?: boolean | null
  width?: number | null
  defaultValue?: boolean | string | null
  options?: FormFieldOption[]
  /** Trailing note on the label row (`Select any`, `USD`). */
  hint?: string | null
  /** Resting hint inside the control. */
  placeholder?: string | null
  /** Character cap; turns the label's trailing note into a live counter. */
  maxLength?: number | null
  /** Escape-hatch chip on a capability set. */
  unsureLabel?: string | null
  /** Static rich text, for the `message` block. */
  message?: unknown
  /** Which part of an inquiry this answer becomes. */
  mapsTo?: string | null
  /** Title of a `step` divider. */
  title?: string | null
}

export type FormDelivery = NonNullable<Form['delivery']>

/** What an inquiries-delivery form files its submissions as. */
export type FormInquiryType = Form['inquiryType']

/** Copy for a form that asks its steps one at a time (Forms → Steps). */
export type FormStepsCopy = Form['steps']
