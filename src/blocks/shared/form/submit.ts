import { getClientSideURL } from '@/utilities/getURL'
import { isQuestion, UNSURE } from './answers'
import type { FormDelivery, FormInquiryType, ResolvedFormField } from './types'

export type SubmitResult = { reference: string | null; submittedAt: string }

export type SubmitArgs = {
  delivery: FormDelivery
  fields: ResolvedFormField[]
  formId: number | string
  /** What the inquiry is filed as. The form declares this; see `inquiryType` in Forms. */
  inquiryType?: FormInquiryType
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
}: SubmitArgs): Promise<SubmitResult> {
  const base = getClientSideURL()
  const sourceUrl = typeof window === 'undefined' ? undefined : window.location.href

  if (delivery === 'inquiries') {
    const res = await fetch(`${base}/api/inquiries/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...toInquiry(fields, values),
        // Forms created before the field existed carry no type; they were all
        // the project template, so that stays their meaning.
        type: inquiryType ?? 'project',
        sourceUrl,
        // Honeypot — a human never sees this field, so it is always empty.
        role: values.role,
      }),
    })
    const body = (await res.json().catch(() => ({}))) as {
      error?: string
      reference?: string | null
      submittedAt?: string
    }
    if (!res.ok) throw new Error(body.error ?? 'Something went wrong. Try again.')
    return {
      reference: body.reference ?? null,
      submittedAt: body.submittedAt ?? new Date().toISOString(),
    }
  }

  const res = await fetch(`${base}/api/form-submissions`, {
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
