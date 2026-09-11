import type { InquiryType } from '@/shared/content/inquiry'

export type SubmitResult = { reference: string | null; submittedAt: string }

/** What the public intake (POST /api/inquiries/submit) accepts; it validates every field again. */
export type InquiryPayload = Record<string, unknown> & {
  type: InquiryType
  /** Opened from Ask (the contact-form handoff, or sent from Ask's handoff card). */
  fromAsk?: boolean
}

/**
 * The one door into the inquiries inbox from the browser, for every surface
 * that files one: the contact forms (`submitForm`) and Ask's handoff card. A
 * same-origin path rather than the resolved site URL, so a client-only
 * surface can import it without pulling the server URL resolver along.
 */
export async function postInquiry(inquiry: InquiryPayload): Promise<SubmitResult> {
  const res = await fetch('/api/inquiries/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...inquiry,
      sourceUrl: typeof window === 'undefined' ? undefined : window.location.href,
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
