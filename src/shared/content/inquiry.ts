/**
 * The inquiry vocabulary — the one place the inbox, the contact form, the
 * notification emails, and the CMS block config agree on what a request can
 * say.
 *
 * Capabilities are deliberately absent: "what you need" is answered from the
 * `capabilities` taxonomy, so the studio's service list is edited once and the
 * form follows.
 */
export type InquiryOption = { label: string; value: string }

/** Which template a request came from. Drives conditional fields in the admin. */
export const INQUIRY_TYPES = [
  { label: 'Project inquiry', value: 'project' },
  { label: 'General message', value: 'general' },
] as const satisfies readonly InquiryOption[]

/**
 * Triage state. `new` is the only one the public endpoint may write; every
 * other transition is a person deciding something, which is why the admin
 * stamps `readAt` / `repliedAt` alongside.
 */
export const INQUIRY_STATUSES = [
  { label: 'New', value: 'new' },
  { label: 'In progress', value: 'in-progress' },
  { label: 'Replied', value: 'replied' },
  { label: 'Closed', value: 'closed' },
  { label: 'Spam', value: 'spam' },
] as const satisfies readonly InquiryOption[]

/** Statuses that still want someone's attention — what the inbox counts. */
export const INQUIRY_OPEN_STATUSES = ['new', 'in-progress'] as const

export const INQUIRY_BUDGETS = [
  { label: 'Under 25K', value: 'under-25k' },
  { label: '25–50K', value: '25-50k' },
  { label: '50–100K', value: '50-100k' },
  { label: '100K +', value: '100k-plus' },
  { label: 'Need guidance', value: 'guidance' },
] as const satisfies readonly InquiryOption[]

export const INQUIRY_TIMELINES = [
  { label: 'As soon as possible', value: 'asap' },
  { label: '1–3 months', value: '1-3-months' },
  { label: '3–6 months', value: '3-6-months' },
  { label: 'Just exploring', value: 'exploring' },
] as const satisfies readonly InquiryOption[]

/** Longest brief the form accepts, and the counter's denominator. */
export const INQUIRY_MESSAGE_MAX_LENGTH = 1200

export type InquiryType = (typeof INQUIRY_TYPES)[number]['value']
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number]['value']

/** Human label for a stored value, for emails and read-only summaries. */
export const inquiryOptionLabel = (
  options: readonly InquiryOption[],
  value?: string | null,
): string | undefined => options.find((option) => option.value === value)?.label

/**
 * Reference prefix and alphabet. Crockford-style: no I, L, O, U, so a
 * reference read down a phone line can't come back as a different one.
 */
const REFERENCE_PREFIX = 'SS'
const REFERENCE_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
const REFERENCE_LENGTH = 4

/**
 * A short, unguessable handle a visitor and the studio can both quote. Random
 * rather than sequential on purpose: a sequential reference in a confirmation
 * email leaks how much work comes in.
 */
export const generateInquiryReference = (random: () => number = Math.random): string => {
  let body = ''
  for (let index = 0; index < REFERENCE_LENGTH; index += 1) {
    body += REFERENCE_ALPHABET[Math.floor(random() * REFERENCE_ALPHABET.length)]
  }
  return `${REFERENCE_PREFIX}-${body}`
}
