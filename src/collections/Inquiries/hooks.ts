import type { CollectionBeforeChangeHook } from 'payload'
import type { Inquiry } from '@/payload-types'
import { generateInquiryReference } from '@/shared/content/inquiry'

/** Attempts before giving up on finding a free reference. */
const REFERENCE_ATTEMPTS = 8

/**
 * Mint the visitor-facing reference and stamp when the request arrived.
 *
 * The reference is random rather than sequential, so it is checked against the
 * table before use. Postgres would reject a duplicate anyway (the column is
 * unique) — this just turns a 1-in-a-million collision into a retry instead of
 * a lost submission.
 */
export const assignReference: CollectionBeforeChangeHook<Inquiry> = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create') return data

  data.submittedAt ??= new Date().toISOString()

  if (!data.reference) {
    for (let attempt = 0; attempt < REFERENCE_ATTEMPTS; attempt += 1) {
      const reference = generateInquiryReference()
      const { totalDocs } = await req.payload.count({
        collection: 'inquiries',
        where: { reference: { equals: reference } },
        req,
      })
      if (totalDocs === 0) {
        data.reference = reference
        break
      }
    }
  }

  return data
}

/**
 * Keep the handling dates honest: "replied" is the moment someone said so, and
 * moving back off it clears the stamp so the inbox never claims an answer that
 * was withdrawn.
 */
export const stampHandlingDates: CollectionBeforeChangeHook<Inquiry> = ({ data, originalDoc }) => {
  if (data.status === originalDoc?.status) return data

  if (data.status === 'replied') {
    data.repliedAt = data.repliedAt ?? new Date().toISOString()
  } else if (originalDoc?.status === 'replied') {
    data.repliedAt = null
  }

  return data
}
