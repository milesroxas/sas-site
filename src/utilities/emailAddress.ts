/** RFC 5321 caps the full address at 254 octets. */
export const EMAIL_MAX_LENGTH = 254

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Lowercase + trim — the canonical form stored and compared everywhere. */
export const normalizeEmailAddress = (raw: string): string => raw.trim().toLowerCase()

/** Pragmatic shape check (real validation is the double-opt-in delivery itself). */
export const isValidEmailAddress = (email: string): boolean =>
  email.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(email)

/** Runs of characters that can hold an address in running text. */
const EMAIL_CANDIDATES = /[^\s@<>()[\]"',;:]+@[^\s@<>()[\]"',;:]+/g

/**
 * The first address written in free text (a chat message), normalized, or
 * null. Sentence punctuation after it ("reach me at a@b.co.") is not part of
 * the address; the same shape check as every other address decides the rest.
 */
export const findEmailAddress = (text: string): string | null => {
  for (const [candidate] of text.matchAll(EMAIL_CANDIDATES)) {
    const email = normalizeEmailAddress(candidate.replace(/[.!?]+$/, ''))
    if (isValidEmailAddress(email)) return email
  }
  return null
}
