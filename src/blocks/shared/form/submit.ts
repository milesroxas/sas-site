import { type AskHandoffIds, askInquiryFields } from '@/features/ask/handoff'
import { getClientSideURL } from '@/utilities/getURL'
import { isQuestion, UNSURE } from './answers'
import { postInquiry, type SubmitResult } from './post-inquiry'
import type { FormDelivery, FormInquiryType, ResolvedFormField } from './types'

export type SubmitArgs = {
  delivery: FormDelivery
  fields: ResolvedFormField[]
  formId: number | string
  /** What the inquiry is filed as. The form declares this; see `inquiryType` in Forms. */
  inquiryType?: FormInquiryType
  /** The Ask chat the message was opened from (see features/ask/handoff), if any. */
  ask?: AskHandoffIds | null
  values: Record<string, unknown>
}

const asArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(String) : typeof value === 'string' && value ? [value] : []

/**
 * The inquiry an answered form becomes.
 *
 * The mapping is the form's own — each field says which part of an inquiry it
 * is — so renaming a question never silently empties a column. Anything left
 * unmapped is appended to the brief rather than dropped: an editor who adds a
 * question and forgets to map it should still see the answer.
 */
function toInquiry(fields: ResolvedFormField[], values: Record<string, unknown>) {
  const inquiry: Record<string, unknown> = {}
  const unmapped: string[] = []

  for (const field of fields) {
    if (!isQuestion(field)) continue
    const value = values[field.name]
    if (value === undefined || value === '' || value === null) continue

    if (!field.mapsTo) {
      unmapped.push(`${field.label || field.name}: ${asArray(value).join(', ') || String(value)}`)
      continue
    }

    if (field.mapsTo === 'capabilities') {
      const picked = asArray(value)
      inquiry.capabilities = picked.filter((entry) => entry !== UNSURE)
      inquiry.capabilitiesUnsure = picked.includes(UNSURE)
      continue
    }

    inquiry[field.mapsTo] = value
  }

  if (unmapped.length > 0) {
    inquiry.message = [inquiry.message, ...unmapped].filter(Boolean).join('\n\n')
  }

  return inquiry
}

/**
 * Send an answered form wherever its `delivery` says, and answer the caller in
 * one shape either way — so a template can show a receipt without caring which
 * of the two it was.
 */
export async function submitForm({
  delivery,
  fields,
  formId,
  inquiryType,
  values,
  ask,
}: SubmitArgs): Promise<SubmitResult> {
  if (delivery === 'inquiries') {
    return postInquiry({
      ...toInquiry(fields, values),
      // Forms created before the field existed carry no type; they were all
      // the project template, so that stays their meaning.
      type: inquiryType ?? 'project',
      ...askInquiryFields(ask ?? null),
      // Honeypot: a human never sees this field, so it is always empty.
      role: values.role,
    })
  }

  const res = await fetch(`${getClientSideURL()}/api/form-submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      form: formId,
      submissionData: Object.entries(values)
        .filter(([name]) => name !== 'role')
        .map(([field, value]) => ({ field, value })),
    }),
  })
  const body = (await res.json().catch(() => ({}))) as { errors?: { message?: string }[] }
  if (!res.ok) throw new Error(body.errors?.[0]?.message ?? 'Something went wrong. Try again.')
  return { reference: null, submittedAt: new Date().toISOString() }
}
