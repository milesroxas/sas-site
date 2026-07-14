/** RFC 5321 caps the full address at 254 octets. */
export const EMAIL_MAX_LENGTH = 254

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Lowercase + trim — the canonical form stored and compared everywhere. */
export const normalizeEmailAddress = (raw: string): string => raw.trim().toLowerCase()

/** Pragmatic shape check (real validation is the double-opt-in delivery itself). */
export const isValidEmailAddress = (email: string): boolean =>
  email.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(email)
