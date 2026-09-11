/**
 * Strips the identifiers visitors most often paste into a free-text box, before
 * the text is stored. Pattern-based, so it is one layer and not a guarantee: a
 * name or an employer written in plain words survives. The notice at the Ask
 * box asks people to leave personal details out; this catches what slips in.
 *
 * Tuned to keep what makes a question useful to the team: budgets, years,
 * dates, and page slugs pass through untouched.
 */

const EMAIL = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.\p{L}{2,}/gu

/** Query strings and fragments carry tokens and tracking ids; the path stays. */
const URL_QUERY = /\b(https?:\/\/[^\s?#]+)[?#]\S*/gi

/** Vendor key prefixes (OpenAI, Stripe, GitHub, Slack, AWS access keys). */
const PREFIXED_SECRET = /\b(?:sk|pk|rk|ghp|gho|ghs|ghu|xox[abprs]|AKIA)[-_]?[A-Za-z0-9_-]{12,}/g

/**
 * Long opaque strings that mix letters and digits: hex digests, base64 keys.
 * Hyphens are excluded on purpose, so a long page slug is never mistaken for one.
 */
const OPAQUE_TOKEN = /\b(?=[A-Za-z0-9_]*\d)(?=[A-Za-z0-9_]*[A-Za-z])[A-Za-z0-9_]{24,}\b/g

/** Digit runs with phone-style separators; the replacer decides what they are. */
const NUMBER_RUN = /\+?\d[\d\s().-]{5,}\d/g

/** Shapes that look like a long number but carry meaning, not identity. */
const MEANINGFUL_NUMBER = [
  /^(?:19|20)\d{2}\s*-\s*(?:19|20)\d{2}$/, // year range, "2019-2024"
  /^\d{4}-\d{2}-\d{2}$/, // ISO date, "2026-10-01"
]

const CURRENCY = /[$€£¥]$/

const MIN_IDENTIFYING_DIGITS = 7
const MAX_IDENTIFYING_DIGITS = 19

function redactNumberRun(match: string, offset: number, text: string): string {
  const digits = match.replace(/\D/g, '').length
  if (digits < MIN_IDENTIFYING_DIGITS || digits > MAX_IDENTIFYING_DIGITS) return match
  if (MEANINGFUL_NUMBER.some((shape) => shape.test(match.trim()))) return match
  // "$50000-100000" is a budget, and a budget is the point of the question.
  if (CURRENCY.test(text.slice(0, offset).trimEnd())) return match
  return '[number]'
}

export function redactFreeText(text: string): string {
  return text
    .replace(EMAIL, '[email]')
    .replace(URL_QUERY, '$1')
    .replace(PREFIXED_SECRET, '[secret]')
    .replace(OPAQUE_TOKEN, '[secret]')
    .replace(NUMBER_RUN, redactNumberRun)
}
