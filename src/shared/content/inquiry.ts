/**
 * The inquiry vocabulary — the one place the inbox, the contact form, the
 * notification emails, and the CMS block config agree on what a request can
 * say.
 *
 * Capabilities are deliberately absent: "what you need" is answered from the
 * `capabilities` taxonomy, so the studio's service list is edited once and the
 * form follows.
 */
import type { SiteInfo } from '@/payload-types'
import { optionLabel, type SelectOption } from './options'

export type InquiryOption = SelectOption

/**
 * Which kind of form a request came from. Declared per form (Forms → sidebar,
 * with Delivery set to the inbox) and drives conditional fields in the admin.
 */
export const INQUIRY_TYPES = [
  { label: 'Project inquiry', value: 'project' },
  { label: 'General message', value: 'general' },
] as const satisfies readonly InquiryOption[]

/**
 * Triage state. `new` is the only one the public endpoint may write; every
 * other transition is a person deciding something, which is why the admin
 * stamps `repliedAt` alongside.
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

/**
 * Where a form field's answer lands on an inquiry.
 *
 * A form-builder submission is flat `{field, value}` pairs, so a form that
 * feeds the inbox says explicitly which of its fields is the name, which is
 * the brief, and so on. Explicit rather than by convention on the field name:
 * an editor renaming "email" to "Your email" must not silently empty a column.
 */
export const INQUIRY_FIELD_TARGETS = [
  { label: 'Name', value: 'name' },
  { label: 'Email address', value: 'email' },
  { label: 'Company', value: 'company' },
  { label: 'Current site', value: 'website' },
  { label: 'What they need', value: 'capabilities' },
  { label: 'Budget', value: 'budget' },
  { label: 'Timeline', value: 'timeline' },
  { label: 'The brief', value: 'message' },
] as const satisfies readonly InquiryOption[]

/** How a form's answers are stored: the generic log, or the triaged inbox. */
export const FORM_DELIVERY = [
  { label: 'Form submissions', value: 'submissions' },
  { label: 'Inquiries inbox', value: 'inquiries' },
] as const satisfies readonly InquiryOption[]

/**
 * Copy for a form that asks its steps one at a time. The Forms sidebar seeds
 * these as defaults and the stepper falls back to them, so a form saved before
 * the group existed reads the same as one saved after.
 */
export const FORM_STEP_COPY = {
  continueLabel: 'Continue',
  editLabel: 'Edit',
  note: 'Nothing is sent until the last step.',
} as const

/** Longest brief the form accepts, and the counter's denominator. */
export const INQUIRY_MESSAGE_MAX_LENGTH = 1200

/**
 * The one thing an inquiry cannot do without, said the same way wherever it
 * is checked: the intake endpoint, and Ask's handoff card before it posts.
 */
export const INQUIRY_EMAIL_INVALID = 'Enter an email address we can reply to.'

export type InquiryType = (typeof INQUIRY_TYPES)[number]['value']
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number]['value']

/**
 * The reply promise, completing "you'll hear back ___". Stated once in Site
 * Info › Inquiries; the contact page and Ask's handoff card both read it
 * through here, so they fall back the same way when it is left empty.
 */
/** The reply promise when Site Info leaves the response time empty. */
export const INQUIRY_RESPONSE_TIME_FALLBACK = 'shortly'

export const inquiryResponseTime = (
  siteInfo: Pick<SiteInfo, 'inquiries'> | null | undefined,
): string => siteInfo?.inquiries?.responseTime || INQUIRY_RESPONSE_TIME_FALLBACK

/** Human label for a stored value, for emails and read-only summaries. */
export const inquiryOptionLabel = optionLabel

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
